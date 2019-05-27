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
	"testing"

	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"

	"github.com/kubeflow/metadata/service"
)

func testMLMDStore(t *testing.T) *mlmetadata.Store {
	cfg := &mlpb.ConnectionConfig{
		Config: &mlpb.ConnectionConfig_FakeDatabase{
			&mlpb.FakeDatabaseConfig{},
		},
	}

	store, err := mlmetadata.NewStore(cfg)
	if err != nil {
		t.Fatalf("Failed to create ML Metadata Store: %v", err)
	}

	return store
}

func TestRegisterSchemas(t *testing.T) {
	registeredTypes, err := RegisterSchemas(service.New(testMLMDStore(t)), schemaDir)
	if err != nil {
		t.Fatalf("failed to register schemas: %v", err)
	}
	mustInclude := []string{
		"kubeflow.org/alpha/data_set",
		"kubeflow.org/alpha/metrics",
		"kubeflow.org/alpha/model",
	}
	for _, tn := range mustInclude {
		if !foundType(registeredTypes, tn) {
			t.Fatalf("Expect to parse predefined %q, but not found in %v", tn, registeredTypes)
		}
	}
}

func foundType(arr []string, target string) bool {
	for _, t := range arr {
		if t == target {
			return true
		}
	}
	return false
}
