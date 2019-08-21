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
	"errors"
	"fmt"
	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
	"reflect"
	"testing"

	"github.com/golang/protobuf/proto"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/kubeflow/metadata/api"
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

func TestGetNamespacedName(t *testing.T) {
	tests := []struct {
		in       string
		wantName string
		wantErr  error
	}{
		// Valid names with specified namespace.
		{"kubeflow.org/v1", "kubeflow.org/v1", nil},
		{"kubeflow.org/v1/Model", "kubeflow.org/v1/Model", nil},
		{"kubeflow.org/v1/Model1/Model", "kubeflow.org/v1/Model1/Model", nil},
		{"kubeflow.org/v1/a/b/c/d", "kubeflow.org/v1/a/b/c/d", nil},

		// Valid names without namespaces, should get the default namespace.
		{"Model", "types.kubeflow.org/default/Model", nil},
		{"kubeflow.org", "types.kubeflow.org/default/kubeflow.org", nil},

		// Error cases.
		{"", "", errors.New("empty type name: \"\"")},
		{"kubeflow.org/v1/", "", errors.New("empty type name: \"kubeflow.org/v1/\"")},
	}

	for _, test := range tests {
		name, err := getNamespacedName(test.in)

		if !reflect.DeepEqual(err, test.wantErr) || name != test.wantName {
			t.Errorf("getNamespacedName(%q) = %q, %v\nWant %q, %v",
				test.in, name, err, test.wantName, test.wantErr)
		}
	}
}

func testMLMDStore(t *testing.T) *mlmetadata.Store {
	cfg := &mlpb.ConnectionConfig{
		Config: &mlpb.ConnectionConfig_FakeDatabase{
			FakeDatabase: &mlpb.FakeDatabaseConfig{},
		},
	}

	store, err := mlmetadata.NewStore(cfg)
	if err != nil {
		t.Fatalf("Failed to create ML Metadata Store: %v", err)
	}

	return store
}

func TestCreateArtifactType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		request      string
		wantResponse string
		wantErr      bool
	}{
		{
			request: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }}`,
			wantResponse: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }} `,
			wantErr: false,
		},
		{
			request:      ``,
			wantResponse: ``,
			wantErr:      true,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		req := &api.CreateArtifactTypeRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		want := &api.CreateArtifactTypeResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		got, err := svc.CreateArtifactType(ctx, req)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nCreateArtifactType\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			}
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nCreateArtifactType\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, want, cmp.Diff(want, got))
		}
	}
}

func TestUpdateArtifactType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		createRequest string
		updateRequest string
		wantResponse  string
		wantErr       bool
	}{
		{
			createRequest: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }}`,
			updateRequest: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }}`,
			wantResponse: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }}`,
			wantErr: false,
		},
		{
			createRequest: ``,
			updateRequest: ``,
			wantResponse:  ``,
			wantErr:       true,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		crtReq := &api.CreateArtifactTypeRequest{}
		if err := proto.UnmarshalText(test.createRequest, crtReq); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		crtRes, err := svc.CreateArtifactType(ctx, crtReq)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nCreateArtifactType\nCreate Request:\n%+v\nGot error:\n%v\nWant nil error",
					i, crtReq, err)
			}
			continue
		}

		updReq := &api.UpdateArtifactTypeRequest{}
		if err := proto.UnmarshalText(test.updateRequest, updReq); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		updRes, err := svc.UpdateArtifactType(ctx, updReq)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nUpdateArtifactType\nUpdate Request:\n%+v\nGot error:\n%v\nWant nil error",
					i, updReq, err)
			}
			continue
		}

		want := &api.UpdateArtifactTypeResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		if crtRes.ArtifactType.GetId() != updRes.ArtifactType.GetId() {
			t.Errorf("Test case %d\nUpdateArtifactType\nCreate artifict Id:\n%v\nUpdate artifict Id:\n%v\n",
				i, crtRes.ArtifactType.GetId(), updRes.ArtifactType.GetId())
		}

		if !cmp.Equal(updRes, want, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nUpdateArtifactType\nCreate:\n%+v\nUpdate:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, crtRes, updRes, want, cmp.Diff(want, updRes, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")))
		}
	}
}

func TestGetArtifactType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	stored := &mlpb.ArtifactType{
		Name: proto.String("my_namespace/Model"),
		Properties: map[string]mlpb.PropertyType{
			"string_field": mlpb.PropertyType_STRING,
			"int_field":    mlpb.PropertyType_INT,
			"double_field": mlpb.PropertyType_DOUBLE,
		},
	}

	_, err := store.PutArtifactType(stored, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		t.Fatalf("store.PutArtifactType failure: %v ", err)
	}

	tests := []struct {
		request      *api.GetArtifactTypeRequest
		wantResponse *api.GetArtifactTypeResponse
		wantErr      bool
	}{
		{
			request: &api.GetArtifactTypeRequest{Name: "my_namespace/Model"},
			wantResponse: &api.GetArtifactTypeResponse{
				ArtifactType: &mlpb.ArtifactType{
					Name: proto.String("my_namespace/Model"),
					Properties: map[string]mlpb.PropertyType{
						"string_field": mlpb.PropertyType_STRING,
						"int_field":    mlpb.PropertyType_INT,
						"double_field": mlpb.PropertyType_DOUBLE,
					}}},
			wantErr: false,
		},
		{
			request:      &api.GetArtifactTypeRequest{Name: "my_namespace/NonExistent"},
			wantResponse: nil,
			wantErr:      true,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		got, err := svc.GetArtifactType(ctx, test.request)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nGetArtifactType\nRequest:\n%+v\nGot error:\n%v\nWant nil error", i, test.request, err)
			}
			continue
		}

		if !cmp.Equal(got, test.wantResponse, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nGetArtifactType\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, test.request, got, test.wantResponse, cmp.Diff(test.wantResponse, got))
		}
	}
}

func TestListArtifactTypes(t *testing.T) {
	tests := []struct {
		stored       []*mlpb.ArtifactType
		wantResponse *api.ListArtifactTypesResponse
	}{
		{
			stored: []*mlpb.ArtifactType{
				&mlpb.ArtifactType{Name: proto.String("my_namespace1/Model1")},
				&mlpb.ArtifactType{Name: proto.String("my_namespace2/Model2")},
			},
			wantResponse: &api.ListArtifactTypesResponse{
				ArtifactTypes: []*mlpb.ArtifactType{
					&mlpb.ArtifactType{Name: proto.String("my_namespace1/Model1")},
					&mlpb.ArtifactType{Name: proto.String("my_namespace2/Model2")},
				},
			},
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		store := testMLMDStore(t)
		svc := New(store)

		for _, aType := range test.stored {
			_, err := store.PutArtifactType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
			if err != nil {
				t.Fatalf("Failed to create ArtifactType %+v: %v", aType, err)
			}
		}

		req := &api.ListArtifactTypesRequest{}
		got, err := svc.ListArtifactTypes(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nListArtifactTypesRequest\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, test.wantResponse, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nListArtifactTypes\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, test.wantResponse, cmp.Diff(test.wantResponse, got))
		}
	}
}

func TestCreateArtifact(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	ctx := context.Background()
	req := &api.CreateArtifactTypeRequest{
		ArtifactType: &mlpb.ArtifactType{
			Name: proto.String("kubeflow.org/v1/Model"),
			Properties: map[string]mlpb.PropertyType{
				"string_field": mlpb.PropertyType_STRING,
				"int_field":    mlpb.PropertyType_INT,
				"double_field": mlpb.PropertyType_DOUBLE,
			},
		},
	}
	res, err := svc.CreateArtifactType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ArtifactType with request %v: %v", req, err)
	}

	typeID := res.ArtifactType.GetId()

	tests := []struct {
		request      string
		wantResponse string
	}{
		{
			request: ` artifact {
				uri: "gs://some-uri"
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "artifact_types/kubeflow.org/v1/Model" `,
			wantResponse: ` artifact {
				uri: "gs://some-uri"
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &api.CreateArtifactRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := &api.CreateArtifactResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		want.Artifact.TypeId = proto.Int64(typeID)

		got, err := svc.CreateArtifact(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateArtifact\nRequest:\n%+v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.Artifact{}, "Id")) {
			t.Errorf("Test case %d\nCreateArtifact\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}
	}
}

func TestGetArtifact(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	aType := &mlpb.ArtifactType{
		Name: proto.String("kubeflow.org/v1/Model"),
		Properties: map[string]mlpb.PropertyType{
			"string_field": mlpb.PropertyType_STRING,
			"int_field":    mlpb.PropertyType_INT,
			"double_field": mlpb.PropertyType_DOUBLE,
		},
	}

	typeID, err := store.PutArtifactType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		t.Fatalf("Failed to create ArtifactType %+v: %v", aType, err)
	}

	tests := []struct {
		name         string
		stored       string
		wantResponse string
	}{
		{
			name: "artifact_types/kubeflow.org/v1/Model/artifacts/1",
			stored: `
				uri: "gs://some-uri"
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }}`,
			wantResponse: ` artifact {
				uri: "gs://some-uri"
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }`,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		req := &api.GetArtifactRequest{Name: test.name}

		stored := &mlpb.Artifact{}
		if err := proto.UnmarshalText(test.stored, stored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		stored.TypeId = proto.Int64(int64(typeID))

		_, err := store.PutArtifacts([]*mlpb.Artifact{stored})
		if err != nil {
			t.Errorf("Test case %d\nstore.PutArtifact failure: %v ", i, err)
		}

		want := &api.GetArtifactResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		got, err := svc.GetArtifact(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nGetArtifact\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.Artifact{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nGetArtifact\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, want, cmp.Diff(want, got))
		}
	}
}

func TestListArtifactsWhenNoneExists(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)
	resp, err := svc.ListArtifacts(context.Background(), &api.ListArtifactsRequest{
		Name: "",
	})
	if err != nil || len(resp.GetArtifacts()) != 0 {
		t.Fatalf("Expect {} but got response %v with err '%v'", resp, err)
	}
}

func TestListArtifacts(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	storeArtifact(
		t,
		store,
		"kubeflow.org/v1/Model",
		[]*mlpb.Artifact{
			&mlpb.Artifact{Uri: proto.String("artifact_1")},
			&mlpb.Artifact{Uri: proto.String("artifact_2")}})

	storeArtifact(
		t,
		store,
		"kubeflow.org/v1/Dataset",
		[]*mlpb.Artifact{
			&mlpb.Artifact{Uri: proto.String("artifact_3")}})

	tests := []struct {
		request      *api.ListArtifactsRequest
		wantResponse *api.ListArtifactsResponse
	}{
		{
			request: &api.ListArtifactsRequest{Name: "kubeflow.org/v1/Model"},
			wantResponse: &api.ListArtifactsResponse{
				Artifacts: []*mlpb.Artifact{
					&mlpb.Artifact{Uri: proto.String("artifact_1")},
					&mlpb.Artifact{Uri: proto.String("artifact_2")},
				},
			},
		},
		{
			request: &api.ListArtifactsRequest{Name: "kubeflow.org/v1/Dataset"},
			wantResponse: &api.ListArtifactsResponse{
				Artifacts: []*mlpb.Artifact{
					&mlpb.Artifact{Uri: proto.String("artifact_3")},
				},
			},
		},
		{
			request: &api.ListArtifactsRequest{},
			wantResponse: &api.ListArtifactsResponse{
				Artifacts: []*mlpb.Artifact{
					&mlpb.Artifact{Uri: proto.String("artifact_1")},
					&mlpb.Artifact{Uri: proto.String("artifact_2")},
					&mlpb.Artifact{Uri: proto.String("artifact_3")},
				},
			},
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		got, err := svc.ListArtifacts(ctx, test.request)
		if err != nil {
			t.Errorf("Test case %d\nListArtifactsRequest\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, test.request, err)
			continue
		}

		if !cmp.Equal(got, test.wantResponse, cmpopts.IgnoreFields(mlpb.Artifact{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nListArtifacts\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, test.request, got, test.wantResponse, cmp.Diff(test.wantResponse, got))
		}
	}
}

func TestCreateExecutionType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		request      string
		wantResponse string
	}{
		{
			request: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE } }`,
			wantResponse: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE } }`,
		},
		// TODO(neuromage): Add more test cases.
	}

	ctx := context.Background()
	for i, test := range tests {
		req := &api.CreateExecutionTypeRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		want := &api.CreateExecutionTypeResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		got, err := svc.CreateExecutionType(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateExecutionType\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nCreateExecutionType\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, want, cmp.Diff(want, got))
		}
	}
}

func TestUpdateExecutionType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		createRequest string
		updateRequest string
		wantResponse  string
		wantErr       bool
	}{
		{
			createRequest: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }}`,
			updateRequest: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }}`,
			wantResponse: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }}`,
			wantErr: false,
		},
		{
			createRequest: ``,
			updateRequest: ``,
			wantResponse:  ``,
			wantErr:       true,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		crtReq := &api.CreateExecutionTypeRequest{}
		if err := proto.UnmarshalText(test.createRequest, crtReq); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		crtRes, err := svc.CreateExecutionType(ctx, crtReq)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nCreateExecutionType\nCreate Request:\n%+v\nGot error:\n%v\nWant nil error",
					i, crtReq, err)
			}
			continue
		}

		updReq := &api.UpdateExecutionTypeRequest{}
		if err := proto.UnmarshalText(test.updateRequest, updReq); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		updRes, err := svc.UpdateExecutionType(ctx, updReq)
		if err != nil {
			if !test.wantErr {
				t.Errorf("Test case %d\nUpdateExecutionType\nUpdate Request:\n%+v\nGot error:\n%v\nWant nil error",
					i, updReq, err)
			}
			continue
		}

		want := &api.UpdateExecutionTypeResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v", i, err)
			continue
		}

		if crtRes.ExecutionType.GetId() != updRes.ExecutionType.GetId() {
			t.Errorf("Test case %d\nUpdateExecutionType\nCreate execution Id:\n%v\nUpdate execution Id:\n%v\n",
				i, crtRes.ExecutionType.GetId(), updRes.ExecutionType.GetId())
		}

		if !cmp.Equal(updRes, want, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nUpdateExecutionType\nCreate:\n%+v\nUpdate:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, crtRes, updRes, want, cmp.Diff(want, updRes, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")))
		}
	}
}

func TestGetExecutionType(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		name         string
		stored       string
		wantResponse string
	}{
		{
			name: "my_namespace/MyExecution",
			stored: `
				name:      "my_namespace/MyExecution"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }`,
			wantResponse: ` execution_type {
				name:      "my_namespace/MyExecution"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }} `,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		req := &api.GetExecutionTypeRequest{Name: test.name}

		stored := &mlpb.ExecutionType{}
		if err := proto.UnmarshalText(test.stored, stored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		_, err := store.PutExecutionType(stored, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
		if err != nil {
			t.Errorf("Test case %d\nstore.PutExecutionType failure: %v ", i, err)
		}

		want := &api.GetExecutionTypeResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		got, err := svc.GetExecutionType(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nGetExecutionType\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nGetExecutionType\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, want, cmp.Diff(want, got))
		}
	}
}

func TestListExecutionTypes(t *testing.T) {
	tests := []struct {
		stored       []*mlpb.ExecutionType
		wantResponse *api.ListExecutionTypesResponse
	}{
		{
			stored: []*mlpb.ExecutionType{
				&mlpb.ExecutionType{Name: proto.String("my_namespace1/Exec1")},
				&mlpb.ExecutionType{Name: proto.String("my_namespace2/Exec2")},
			},
			wantResponse: &api.ListExecutionTypesResponse{
				ExecutionTypes: []*mlpb.ExecutionType{
					&mlpb.ExecutionType{Name: proto.String("my_namespace1/Exec1")},
					&mlpb.ExecutionType{Name: proto.String("my_namespace2/Exec2")},
				},
			},
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		store := testMLMDStore(t)
		svc := New(store)

		for _, aType := range test.stored {
			_, err := store.PutExecutionType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
			if err != nil {
				t.Fatalf("Failed to create ExecutionType %+v: %v", aType, err)
			}
		}

		req := &api.ListExecutionTypesRequest{}
		got, err := svc.ListExecutionTypes(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nListExecutionTypesRequest\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, test.wantResponse, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nListExecutionTypes\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, test.wantResponse, cmp.Diff(test.wantResponse, got))
		}
	}
}

func TestCreateExecution(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	ctx := context.Background()
	req := &api.CreateExecutionTypeRequest{
		ExecutionType: &mlpb.ExecutionType{
			Name: proto.String("kubeflow.org/v1/Execution"),
			Properties: map[string]mlpb.PropertyType{
				"string_field": mlpb.PropertyType_STRING,
				"int_field":    mlpb.PropertyType_INT,
				"double_field": mlpb.PropertyType_DOUBLE,
			},
		},
	}
	res, err := svc.CreateExecutionType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ExecutionType with request %v: %v", req, err)
	}

	typeID := res.ExecutionType.GetId()

	tests := []struct {
		request      string
		wantResponse string
	}{
		{
			request: ` execution {
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "execution_types/kubeflow.org/v1/Execution" `,
			wantResponse: ` execution {
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &api.CreateExecutionRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := &api.CreateExecutionResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		want.Execution.TypeId = proto.Int64(typeID)

		got, err := svc.CreateExecution(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateExecution\nRequest:\n%+v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.Execution{}, "Id")) {
			t.Errorf("Test case %d\nCreateExecution\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}
	}
}

func TestGetExecution(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	aType := &mlpb.ExecutionType{
		Name: proto.String("kubeflow.org/v1/MyExecution"),
		Properties: map[string]mlpb.PropertyType{
			"string_field": mlpb.PropertyType_STRING,
			"int_field":    mlpb.PropertyType_INT,
			"double_field": mlpb.PropertyType_DOUBLE,
		},
	}

	typeID, err := store.PutExecutionType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		t.Fatalf("Failed to create ExecutionType %+v: %v", aType, err)
	}

	tests := []struct {
		name         string
		stored       string
		wantResponse string
	}{
		{
			name: "execution_types/kubeflow.org/v1/MyExecution/executions/1",
			stored: `
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }}`,
			wantResponse: ` execution {
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }`,
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		req := &api.GetExecutionRequest{Name: test.name}

		stored := &mlpb.Execution{}
		if err := proto.UnmarshalText(test.stored, stored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		stored.TypeId = proto.Int64(int64(typeID))

		_, err := store.PutExecutions([]*mlpb.Execution{stored})
		if err != nil {
			t.Errorf("Test case %d\nstore.PutExecution failure: %v ", i, err)
		}

		want := &api.GetExecutionResponse{}
		if err := proto.UnmarshalText(test.wantResponse, want); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		got, err := svc.GetExecution(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nGetExecution\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, req, err)
			continue
		}

		if err == nil && !cmp.Equal(got, want, cmpopts.IgnoreFields(mlpb.Execution{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nGetExecution\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, req, got, want, cmp.Diff(want, got))
		}
	}
}

func TestListExecutionsWhenNoneExists(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)
	resp, err := svc.ListExecutions(context.Background(), &api.ListExecutionsRequest{
		Name: "",
	})
	if err != nil || len(resp.GetExecutions()) != 0 {
		t.Fatalf("Expect {} but got response %v with err '%v'", resp, err)
	}
}

func TestListExecutions(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	storeExecution(
		t,
		store,
		"kubeflow.org/v1/MyExecutionType1",
		[]*mlpb.Execution{
			&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e1"}}}},
			&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e2"}}}},
		})

	storeExecution(
		t,
		store,
		"kubeflow.org/v1/MyExecutionType2",
		[]*mlpb.Execution{
			&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e3"}}}},
		})

	tests := []struct {
		request      *api.ListExecutionsRequest
		wantResponse *api.ListExecutionsResponse
	}{
		{
			request: &api.ListExecutionsRequest{Name: "kubeflow.org/v1/MyExecutionType1"},
			wantResponse: &api.ListExecutionsResponse{
				Executions: []*mlpb.Execution{
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e1"}}}},
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e2"}}}},
				},
			},
		},
		{
			request: &api.ListExecutionsRequest{Name: "kubeflow.org/v1/MyExecutionType2"},
			wantResponse: &api.ListExecutionsResponse{
				Executions: []*mlpb.Execution{
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e3"}}}},
				},
			},
		},
		{
			request: &api.ListExecutionsRequest{},
			wantResponse: &api.ListExecutionsResponse{
				Executions: []*mlpb.Execution{
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e1"}}}},
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e2"}}}},
					&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e3"}}}},
				},
			},
		},
	}

	ctx := context.Background()
	for i, test := range tests {
		got, err := svc.ListExecutions(ctx, test.request)
		if err != nil {
			t.Errorf("Test case %d\nListExecutionsRequest\nRequest:\n%v\nGot error:\n%v\nWant nil error", i, test.request, err)
			continue
		}

		if err == nil && !cmp.Equal(got, test.wantResponse, cmpopts.IgnoreFields(mlpb.Execution{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nListExecutions\nRequest:\n%v\nGot:\n%+v\nWant:\n%+v\nDiff\n%v\n",
				i, test.request, got, test.wantResponse, cmp.Diff(test.wantResponse, got))
		}
	}
}

func TestCreateEventsAndList(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	executions := storeExecution(
		t,
		store,
		"kubeflow.org/v1/MyExecutionType1",
		[]*mlpb.Execution{
			&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e1"}}}},
			&mlpb.Execution{Properties: map[string]*mlpb.Value{"name": &mlpb.Value{Value: &mlpb.Value_StringValue{StringValue: "e2"}}}},
		})
	artifacts := storeArtifact(
		t,
		store,
		"kubeflow.org/v1/Model",
		[]*mlpb.Artifact{
			&mlpb.Artifact{Uri: proto.String("artifact_1")},
			&mlpb.Artifact{Uri: proto.String("artifact_2")}})

	inputType := mlpb.Event_INPUT
	outputType := mlpb.Event_OUTPUT
	e1 := &mlpb.Event{
		ArtifactId:  proto.Int64((int64)(artifacts[0])),
		ExecutionId: proto.Int64((int64)(executions[0])),
		Type:        &inputType,
	}
	e2 := &mlpb.Event{
		ArtifactId:  proto.Int64((int64)(artifacts[0])),
		ExecutionId: proto.Int64((int64)(executions[1])),
		Type:        &inputType,
	}
	e3 := &mlpb.Event{
		ArtifactId:  proto.Int64((int64)(artifacts[1])),
		ExecutionId: proto.Int64((int64)(executions[0])),
		Type:        &outputType,
	}
	for _, e := range []*mlpb.Event{e1, e2, e3} {
		_, err := svc.CreateEvent(context.Background(), &api.CreateEventRequest{Event: e})
		if err != nil {
			t.Fatalf("Failed to create event %v, err %v\n", e, err)
		}
	}
	resp1, err := svc.ListEvents(
		context.Background(),
		&api.ListEventsRequest{
			Name: fmt.Sprintf("artifacts/%d", artifacts[0]),
		})
	if err != nil || len(resp1.Events) != 2 || len(resp1.GetArtifacts()) != 1 || len(resp1.GetExecutions()) != 2 {
		t.Fatalf("Expect to find 2 events, but got response %v with err %v\n", resp1, err)
	}

	resp2, err := svc.ListEvents(
		context.Background(),
		&api.ListEventsRequest{
			Name: fmt.Sprintf("executions/%d", executions[0]),
		})
	if err != nil || len(resp2.Events) != 2 || len(resp2.GetArtifacts()) != 2 || len(resp2.GetExecutions()) != 1 {
		t.Fatalf("Expect to find 2 events, but got response %v with err %v\n", resp2, err)
	}

}

func storeArtifact(t *testing.T, store *mlmetadata.Store, typename string, artifacts []*mlpb.Artifact) []mlmetadata.ArtifactID {
	aType := &mlpb.ArtifactType{Name: proto.String(typename)}

	typeID, err := store.PutArtifactType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		t.Fatalf("Failed to create ArtifactType %+v: %v", aType, err)
	}

	for _, artifact := range artifacts {
		artifact.TypeId = proto.Int64(int64(typeID))
	}

	resp, err := store.PutArtifacts(artifacts)
	if err != nil {
		t.Fatalf("Failed to put Artifacts %+v: %v", artifacts, err)
	}
	return resp
}

func storeExecution(t *testing.T, store *mlmetadata.Store, typename string, executions []*mlpb.Execution) []mlmetadata.ExecutionID {
	aType := &mlpb.ExecutionType{
		Name:       proto.String(typename),
		Properties: map[string]mlpb.PropertyType{"name": mlpb.PropertyType_STRING},
	}

	typeID, err := store.PutExecutionType(aType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		t.Fatalf("Failed to create ExecutionType %+v: %v", aType, err)
	}

	for _, execution := range executions {
		execution.TypeId = proto.Int64(int64(typeID))
	}

	resp, err := store.PutExecutions(executions)
	if err != nil {
		t.Fatalf("Failed to put Executions %+v: %v", executions, err)
	}
	return resp
}
