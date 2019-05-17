// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package service exports the type Service which implements the API defined by
// MetadataService.
package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang/glog"
	"github.com/golang/protobuf/proto"
	pb "github.com/kubeflow/metadata/api"
	mlmd "github.com/kubeflow/metadata/ml_metadata"
	"github.com/kubeflow/metadata/schemaparser"
)

const (
	wholeMetaPropertyName string = "__ALL_META__"
	categoryPropertyName  string = "category"
	artifactCategory      string = "artifact"
	defaultTimeout               = 5 * time.Second
)

// Service implements the gRPC service MetadataService defined in the metadata
// API spec.
type Service struct {
	mlmdClient       mlmd.MetadataStoreServiceClient
	typeNameToMLMDID map[string]int64

	// TODO: Once MLMD type system supports schema annotations, the following two fields can be obtained by quering MLMD types.
	// map from type name to the schema id, which is used to verify the incoming data.
	typeNameToID map[string]string
	schemaset    *schemaparser.SchemaSet
}

// NewService returns a new MetadataService.
func NewService(mlmdClient mlmd.MetadataStoreServiceClient, schemaRootDir string) (*Service, error) {
	ss, err := schemaparser.NewSchemaSetFromADir(schemaRootDir)
	if err != nil {
		return nil, err
	}
	typeNameToID := make(map[string]string)
	typeNameToMLMDID := make(map[string]int64)
	for id := range ss.Schemas {
		tn, err := ss.TypeName(id)
		if err != nil {
			glog.Warningf("schema misses 'kind', 'apiversion', or 'namespace'. schema $id = %s", id)
			continue
		}
		category, err := ss.ConstantStringType(id, categoryPropertyName)
		if err != nil {
			return nil, fmt.Errorf("schema %q property. schema $id = %s", categoryPropertyName, id)
		}
		switch category {
		case artifactCategory:
			mlmdID, err := registerArtifactType(mlmdClient, ss, id, tn)
			if err != nil {
				return nil, err
			}
			typeNameToID[tn] = id
			typeNameToMLMDID[tn] = mlmdID
			// TODO: add cases for execution and other categories.
		default:
			glog.Errorf("Ignored unknown type %q in %q", tn, id)
		}

	}
	return &Service{
		mlmdClient:       mlmdClient,
		typeNameToMLMDID: typeNameToMLMDID,
		typeNameToID:     typeNameToID,
		schemaset:        ss,
	}, nil
}

func registerArtifactType(mlmdClient mlmd.MetadataStoreServiceClient, ss *schemaparser.SchemaSet, id string, name string) (int64, error) {
	properties, err := ss.SimpleProperties(id)
	if err != nil {
		return 0, err
	}
	artifactType := &mlmd.ArtifactType{
		Name:       &name,
		Properties: make(map[string]mlmd.PropertyType),
	}
	for pname, ptype := range properties {
		if pname == categoryPropertyName {
			continue
		}
		switch ptype {
		case schemaparser.StringType:
			artifactType.Properties[pname] = mlmd.PropertyType_STRING
		case schemaparser.IntegerType:
			artifactType.Properties[pname] = mlmd.PropertyType_INT
		case schemaparser.NumberType:
			artifactType.Properties[pname] = mlmd.PropertyType_DOUBLE
		default:
			return 0, fmt.Errorf("internal error: unknown simple property type %q for property %q", ptype, pname)
		}
	}
	artifactType.Properties[wholeMetaPropertyName] = mlmd.PropertyType_STRING
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()
	response, err := mlmdClient.PutArtifactType(ctx, &mlmd.PutArtifactTypeRequest{
		ArtifactType:   artifactType,
		AllFieldsMatch: proto.Bool(true),
	})
	if err != nil {
		return 0, fmt.Errorf("error response from MLMD server: %s", err)
	}
	return *response.TypeId, nil
}

// GetResource returns the specified resource in the request.
func (s *Service) GetResource(ctx context.Context, in *pb.GetResourceRequest) (*pb.Resource, error) {
	if in.Name == "" {
		return nil, errors.New("must specify name")
	}

	return &pb.Resource{Name: in.Name}, nil
}
