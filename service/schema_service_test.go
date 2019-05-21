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

package service

import (
	"context"
	"testing"

	mlmd "ml_metadata/proto/metadata_store_service_go_proto"

	"github.com/golang/mock/gomock"
	"github.com/kubeflow/metadata/mocks"
)

const schemaDir = "../schema/alpha"

func TestNewService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockMLMDClient := mocks.NewMockMetadataStoreServiceClient(ctrl)
	var mlmdTypeID int64 = 1
	mockMLMDClient.EXPECT().PutArtifactType(gomock.Any(), gomock.Any()).DoAndReturn(
		func(context.Context, *mlmd.PutArtifactTypeRequest) (*mlmd.PutArtifactTypeResponse, error) {
			id := mlmdTypeID
			mlmdTypeID++
			return &mlmd.PutArtifactTypeResponse{
				TypeId: &id,
			}, nil
		}).AnyTimes()
	s, err := NewSchemaService(mockMLMDClient, schemaDir)
	if err != nil {
		t.Fatalf("Failed to create a new service: %v", err)
	}
	mustInclude := []string{
		"namespaces/kubeflow.org/kinds/data_set/versions/alpha",
		"namespaces/kubeflow.org/kinds/metrics/versions/alpha",
		"namespaces/kubeflow.org/kinds/model/versions/alpha",
	}
	for _, typeName := range mustInclude {
		if _, exists := s.typeNameToMLMDID[typeName]; !exists {
			t.Fatalf("Expect to parse predefined %q, but not found", typeName)
		}
	}
}
