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
	"fmt"
	"strings"

	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"

	"github.com/golang/protobuf/proto"
	pb "github.com/kubeflow/metadata/api"
)

// Service implements the gRPC service MetadataService defined in the metadata
// API spec.
type Service struct {
	client *mlmetadata.Store
}

// New returns a new instance of Service.
func New() *Service {
	// client := mlmetadata.NewStore()
	return &Service{}
}

const (
	kfWorkspace   = "kf_workspace"
	kfNamespace   = "kf_namespace"
	kfDescription = "kf_description"

	kfDefaultNamespace = "types.kubeflow.org/default"
)

func toMLMDArtifactType(in *pb.ArtifactType) (*mlpb.ArtifactType, error) {
	res := &mlpb.ArtifactType{
		Id: proto.Int64(in.Id),
	}

	for k, v := range in.TypeProperties {
		if strings.HasPrefix(k, "kf_") {
			return nil, fmt.Errorf("type property %q uses system-reserved prefix 'kf_'", k)
		}

		switch x := v.Type.(type) {
		case *pb.Type_IntegerType:
			res.Properties[k] = mlpb.PropertyType_INT
		case *pb.Type_DoubleType:
			res.Properties[k] = mlpb.PropertyType_DOUBLE
		case *pb.Type_StringType:
			res.Properties[k] = mlpb.PropertyType_STRING
		default:
			return nil, fmt.Errorf("Property %q has invalid type %T", k, x)
		}
	}

	// TODO(neuromage): Check and remove trailing / in namespaces.
	// TODO(neuromage): Check type names.
	namespace := kfDefaultNamespace
	if in.Namespace != nil && in.Namespace.Name != "" {
		namespace = in.Namespace.Name
	}
	name := namespace + "/" + in.Name
	res.Name = proto.String(name)

	// res.Properties[kfNamespace] = namespace

	return res, nil
}

func toArtifactType(in *mlpb.ArtifactType) (*pb.ArtifactType, error) {
	res := &pb.ArtifactType{
		Id: in.GetId(),
	}

	for k, v := range in.Properties {
		switch v {
		case mlpb.PropertyType_INT:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_IntegerType{}}
		case mlpb.PropertyType_DOUBLE:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_DoubleType{}}
		case mlpb.PropertyType_STRING:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_StringType{}}
		}
	}

	// Sanity check!!!!!!!!!!!!
	ns := strings.Split(in.GetName(), "/")

	name := ns[len(ns)-1]
	namespace := strings.Join(ns[0:len(ns)-2], "/")

	res.Namespace = &pb.Namespace{Name: namespace}
	res.Name = name

	return res, nil
}

func (s *Service) CreateArtifactTypeRequest(ctx context.Context, req *pb.CreateArtifactTypeRequest) (*pb.CreateArtifactTypeResponse, error) {

	storedType, err := toMLMDArtifactType(req.GetArtifactType())
	if err != nil {
		return nil, err
	}

	id, err := s.client.PutArtifactType(storedType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	res := &pb.CreateArtifactTypeResponse{Id: int64(id)}

	return res, nil
}
