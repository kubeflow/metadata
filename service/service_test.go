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
	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
	"testing"

	"github.com/golang/protobuf/proto"
	"github.com/google/go-cmp/cmp"
	pb "github.com/kubeflow/metadata/api"
)

func TestValidTypeNames(t *testing.T) {
	names := []string{
		"Model",
		"MyModel123",
		"MyModel123_-123lkj",
		"myModel12-lkj*0972)-",
	}

	for _, n := range names {
		if err := validTypeName(n); err != nil {
			t.Errorf("validTypeName(%q) = %v\nWant nil error", n, err)
		}
	}
}

func TestInvalidTypeNames(t *testing.T) {
	names := []string{
		"1Model",
		"1 Model",
		" 1Model",
		"/1Model",
		"Model/",
		"Model//",
		"A1 Model",
		"A 1Model",
		"A/1Model",
		"A ",
	}

	for _, n := range names {
		if err := validTypeName(n); err == nil {
			t.Errorf("validTypeName(%q) = nil\nWant non-nil error", n)
		}
	}
}

func TestValidNamespaces(t *testing.T) {
	names := []string{
		"kubeflow.org",
		"kubeflow.org/v1",
		"Kubeflow.org/v1",
		"www.kubeflow.org/v1",
		"aa",
	}

	for _, n := range names {
		if err := validNamespace(n); err != nil {
			t.Errorf("validNamespace(%q) = %v\nWant nil error", n, err)
		}
	}
}

func TestInvalidNamespaces(t *testing.T) {
	names := []string{
		"kube flow.org",
		"123kubeflow.org",
		"kubeflow.org/v1/",
		"Kubeflow.org/v1//",
		"/kubeflow.org",
		"a",
		"/",
	}

	for _, n := range names {
		if err := validNamespace(n); err == nil {
			t.Errorf("validNamespace(%q) = nil\nWant non-nil error", n)
		}
	}
}

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

func TestArtifactTypeCreation(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		req  string
		want string
	}{
		{
			req: ` artifact_type {
				name:      "Model"
				namespace: { name: "my_namespace"}
				type_properties {
					key: "string_field"
					value { string_type {} }
				} }
			`,
			want: `
				name:      "my_namespace/Model"
				properties {
					key: "string_field"
					value: STRING
				}
			`,
		},
	}

	for i, test := range tests {
		req := &pb.CreateArtifactTypeRequest{}
		if err := proto.UnmarshalText(test.req, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		// want := &pb.ArtifactType{}
		// if err := proto.UnmarshalText(test.want, want); err != nil {
		// 	t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
		// 	continue
		// }

		ctx := context.Background()
		res, err := svc.CreateArtifactType(ctx, req)
		want := req.GetArtifactType()
		want.Id = res.GetArtifactType().GetId()

		if err != nil || !cmp.Equal(want, res.GetArtifactType()) {
			t.Errorf("Test case %d\nCreateArtifactType\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, res.GetArtifactType(), err, want, cmp.Diff(want, res.GetArtifactType()))
		}
	}
}
