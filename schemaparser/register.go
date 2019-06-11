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

package schemaparser

import (
	"context"
	"fmt"
	"time"

	"github.com/golang/glog"
	"github.com/kubeflow/metadata/api"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
	"github.com/golang/protobuf/proto"
	"github.com/kubeflow/metadata/service"
)

const (
	wholeMetaPropertyName string = "__ALL_META__"
	categoryPropertyName  string = "category"
	artifactCategory      string = "artifact"
	defaultTimeout               = 5 * time.Second
)

// RegisterSchemas registers all predefined schema into the metadata service and returns a list of registered type names.
// TODO(zhenghuiwang): adds the schemas as annotations into MLMD once it supports type annotations.
func RegisterSchemas(service *service.Service, schemaRootDir string) ([]string, error) {
	ss, err := NewSchemaSetFromADir(schemaRootDir)
	if err != nil {
		return nil, err
	}
	var types []string
	for id := range ss.Schemas {
		namespace, typename, err := ss.TypeName(id)
		if err != nil {
			glog.Warningf("schema misses 'kind', 'apiversion', or 'namespace'. schema $id = %s: %v", id, err)
			continue
		}
		category, err := ss.ConstantStringType(id, categoryPropertyName)
		if err != nil {
			return nil, fmt.Errorf("schema %q property. schema $id = %s", categoryPropertyName, id)
		}
		switch category {
		case artifactCategory:
			if err := registerArtifactType(service, ss, id, namespace, typename); err != nil {
				return nil, fmt.Errorf("failed to register schema: %v", err)
			}
			types = append(types, namespace+"/"+typename)
			// TODO(zhenghuiwang): add cases for execution and other categories.
		default:
			glog.Errorf("Ignored unknown type %q in %q", typename, id)
		}
	}
	return types, nil
}

func registerArtifactType(service *service.Service, ss *SchemaSet, id, namespace, typename string) error {
	properties, err := ss.SimpleProperties(id)
	if err != nil {
		return err
	}
	artifactType := &mlpb.ArtifactType{
		Name:       proto.String(namespace + "/" + typename),
		Properties: make(map[string]mlpb.PropertyType),
	}
	for pname, ptype := range properties {
		if isPropertyBuiltIn(pname) {
			continue
		}
		switch ptype {
		case StringType:
			artifactType.Properties[pname] = mlpb.PropertyType_STRING
		case IntegerType:
			artifactType.Properties[pname] = mlpb.PropertyType_INT
		case NumberType:
			artifactType.Properties[pname] = mlpb.PropertyType_DOUBLE
		default:
			return fmt.Errorf("internal error: unknown simple property type %q for property %q", ptype, pname)
		}
	}
	artifactType.Properties[wholeMetaPropertyName] = mlpb.PropertyType_STRING
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()
	_, err = service.CreateArtifactType(ctx, &api.CreateArtifactTypeRequest{
		ArtifactType: artifactType,
	})
	if err != nil {
		return fmt.Errorf("error response from metadata server: %s", err)
	}
	return nil
}

func isPropertyBuiltIn(pname string) bool {
	return pname == categoryPropertyName || pname == namespacePropertyName ||
		pname == kindPropertyName || pname == versionPropertyName || pname == idPropertyName || pname == namePropertyName
}
