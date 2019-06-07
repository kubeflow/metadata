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
	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
	"reflect"
	"testing"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
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

func TestArtifactTypeCreation(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		request    string
		wantStored string
	}{
		{
			request: ` artifact_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }
			}`,
			wantStored: `
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }
				properties { key: "__kf_artifact_name" value: STRING }
				properties { key: "__kf_workspace" value: STRING }
				properties { key: "__kf_create_time" value: INT }
				properties { key: "__kf_update_time" value: INT }
			`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &pb.CreateArtifactTypeRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := proto.Clone(req.ArtifactType).(*pb.ArtifactType)

		ctx := context.Background()
		response, err := svc.CreateArtifactType(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateArtifactType\nRequest:\n%v\nGot error:\n%v\nWant nil error\n", i, req, err)
			continue
		}

		got := response.GetArtifactType()

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(pb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nCreateArtifactType\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}

		wantStored := &mlpb.ArtifactType{}
		if err := proto.UnmarshalText(test.wantStored, wantStored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		gotStored, err := store.GetArtifactTypesByID([]mlmetadata.ArtifactTypeID{mlmetadata.ArtifactTypeID(got.GetId())})
		if err != nil || len(gotStored) != 1 {
			t.Errorf("Test case %d\nstore.GetArtifactType:\n%v, %v\nWant single artifact type and nil error\n", i, gotStored, err)
			continue
		}

		if !cmp.Equal(gotStored[0], wantStored, cmpopts.IgnoreFields(mlpb.ArtifactType{}, "Id")) {
			t.Errorf("Test case %d\nStored ArtifactType:\n%v\nWant:\n%v\nDiff:\n%s",
				i, gotStored, wantStored, cmp.Diff(wantStored, gotStored[0]))
		}
	}
}

func TestArtifactCreation(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	timeNowFn = func() time.Time {
		return time.Unix(123, 0)
	}

	tsProto, err := ptypes.TimestampProto(time.Unix(123, 0))
	if err != nil {
		t.Fatalf("failed to create timestamp proto for tests: %v", err)
	}

	ctx := context.Background()
	req := &pb.CreateArtifactTypeRequest{
		ArtifactType: &pb.ArtifactType{
			Name: "kubeflow.org/v1/Model",
			Properties: map[string]pb.PropertyType{
				"string_field": pb.PropertyType_STRING,
				"int_field":    pb.PropertyType_INT,
				"double_field": pb.PropertyType_DOUBLE,
			},
		},
	}
	_, err = svc.CreateArtifactType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ArtifactType with request %v: %v", req, err)
	}

	tests := []struct {
		request    string
		wantStored string
	}{
		{
			request: ` artifact {
				uri: "gs://some-uri"
				name: "My Model"
				workspace: { name: "my workspace" }
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "artifact_types/kubeflow.org/v1/Model" `,
			wantStored: `
				uri: "gs://some-uri"
				properties { key: "__kf_workspace" value { string_value: "my workspace" }}
				properties { key: "__kf_artifact_name" value { string_value: "My Model" }}
				properties { key: "__kf_create_time" value { int_value: 123 }}
				properties { key: "__kf_update_time" value { int_value: 123 }}
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }}
			`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &pb.CreateArtifactRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := proto.Clone(req.Artifact).(*pb.Artifact)
		want.CreateTime = proto.Clone(tsProto).(*timestamp.Timestamp)
		want.UpdateTime = proto.Clone(tsProto).(*timestamp.Timestamp)

		response, err := svc.CreateArtifact(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateArtifact\nRequest:\n%v\nGot error:\n%v\nWant nil error\n", i, req, err)
			continue
		}

		got := response.Artifact

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(pb.Artifact{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nCreateArtifact\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}

		wantStored := &mlpb.Artifact{}
		if err := proto.UnmarshalText(test.wantStored, wantStored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		gotStored, err := store.GetArtifactsByID([]mlmetadata.ArtifactID{mlmetadata.ArtifactID(got.GetId())})
		if err != nil || len(gotStored) != 1 {
			t.Errorf("Test case %d\nstore.GetArtifact:\n%v, %v\nWant single Artifact and nil error\n", i, gotStored, err)
			continue
		}

		if !cmp.Equal(gotStored[0], wantStored, cmpopts.IgnoreFields(mlpb.Artifact{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nStored ArtifactType:\n%v\nWant:\n%v\nDiff:\n%s",
				i, gotStored[0], wantStored, cmp.Diff(wantStored, gotStored[0]))
		}
	}
}

func TestListArtifacts(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	timeNowFn = func() time.Time {
		return time.Unix(123, 0)
	}

	ctx := context.Background()
	req := &pb.CreateArtifactTypeRequest{
		ArtifactType: &pb.ArtifactType{
			Name: "kubeflow.org/v1/Model",
			Properties: map[string]pb.PropertyType{
				"string_field": pb.PropertyType_STRING,
				"int_field":    pb.PropertyType_INT,
				"double_field": pb.PropertyType_DOUBLE,
			},
		},
	}
	_, err := svc.CreateArtifactType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ArtifactType with request %v: %v", req, err)
	}
	req = &pb.CreateArtifactTypeRequest{
		ArtifactType: &pb.ArtifactType{
			Name: "kubeflow.org/v1/DataSet",
			Properties: map[string]pb.PropertyType{
				"int_field":    pb.PropertyType_INT,
				"double_field": pb.PropertyType_DOUBLE,
			},
		},
	}
	_, err = svc.CreateArtifactType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ArtifactType with request %v: %v", req, err)
	}

	artifacts := []string{
		` artifact {
				uri: "gs://some-uri"
				name: "My Model"
				workspace: { name: "my workspace" }
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "artifact_types/kubeflow.org/v1/Model" `,
		` artifact {
				uri: "gs://some-uri-to-dataset"
				name: "My Dataset"
				workspace: { name: "my workspace" }
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "artifact_types/kubeflow.org/v1/DataSet" `,
	}

	for i, artifact := range artifacts {
		req := &pb.CreateArtifactRequest{}
		if err := proto.UnmarshalText(artifact, req); err != nil {
			t.Fatalf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
		}
		_, err := svc.CreateArtifact(ctx, req)
		if err != nil {
			t.Fatalf("Test case %d\nCreateArtifact\nRequest:\n%v\nGot error:\n%v\nWant nil error\n", i, req, err)
		}
	}

	fulllist, err := svc.ListArtifacts(ctx, &pb.ListArtifactsRequest{})
	if err != nil {
		t.Fatalf("Failed to get artifact list: %v\n", err)
	}
	if len(fulllist.Artifacts) != 2 {
		t.Errorf("Expect to get 2 artifacts but got %v\n", fulllist.Artifacts)
	}
	modellist, err := svc.ListArtifacts(ctx, &pb.ListArtifactsRequest{Name: "artifact_types/kubeflow.org/v1/Model"})
	if err != nil {
		t.Fatalf("Failed to get artifact list: %v\n", err)
	}
	if len(modellist.Artifacts) != 1 {
		t.Errorf("Expect to get 1 artifact but got %v\n", modellist.Artifacts)
	}
}

func TestExecutionTypeCreation(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	tests := []struct {
		request    string
		wantStored string
	}{
		{
			request: ` execution_type {
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }
			}`,
			wantStored: `
				name:      "my_namespace/Model"
				properties { key: "string_field" value: STRING }
				properties { key: "int_field" value: INT }
				properties { key: "double_field" value: DOUBLE }
				properties { key: "__kf_execution_name" value: STRING }
				properties { key: "__kf_workspace" value: STRING }
				properties { key: "__kf_create_time" value: INT }
				properties { key: "__kf_update_time" value: INT }
				properties { key: "__kf_start_time" value: INT }
				properties { key: "__kf_end_time" value: INT }
			`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &pb.CreateExecutionTypeRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := proto.Clone(req.ExecutionType).(*pb.ExecutionType)

		ctx := context.Background()
		response, err := svc.CreateExecutionType(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateExecutionType\nRequest:\n%v\nGot error:\n%v\nWant nil error\n", i, req, err)
			continue
		}

		got := response.GetExecutionType()

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(pb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nCreateExecutionType\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}

		wantStored := &mlpb.ExecutionType{}
		if err := proto.UnmarshalText(test.wantStored, wantStored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		gotStored, err := store.GetExecutionTypesByID([]mlmetadata.ExecutionTypeID{mlmetadata.ExecutionTypeID(got.GetId())})
		if err != nil || len(gotStored) != 1 {
			t.Errorf("Test case %d\nstore.GetExecutionType:\n%v, %v\nWant single execution type and nil error\n", i, gotStored, err)
			continue
		}

		if !cmp.Equal(gotStored[0], wantStored, cmpopts.IgnoreFields(mlpb.ExecutionType{}, "Id")) {
			t.Errorf("Test case %d\nStored ExecutionType:\n%v\nWant:\n%v\nDiff:\n%s",
				i, gotStored, wantStored, cmp.Diff(wantStored, gotStored[0]))
		}
	}
}

func TestExecutionCreation(t *testing.T) {
	store := testMLMDStore(t)
	svc := New(store)

	timeNowFn = func() time.Time {
		return time.Unix(123, 0)
	}

	tsProto, err := ptypes.TimestampProto(time.Unix(123, 0))
	if err != nil {
		t.Fatalf("failed to create timestamp proto for tests: %v", err)
	}

	tsProtoZero, err := ptypes.TimestampProto(time.Unix(0, 0))
	if err != nil {
		t.Fatalf("failed to create timestamp proto for tests: %v", err)
	}

	ctx := context.Background()
	req := &pb.CreateExecutionTypeRequest{
		ExecutionType: &pb.ExecutionType{
			Name: "kubeflow.org/v1/MyPipeline",
			Properties: map[string]pb.PropertyType{
				"string_field": pb.PropertyType_STRING,
				"int_field":    pb.PropertyType_INT,
				"double_field": pb.PropertyType_DOUBLE,
			},
		},
	}
	_, err = svc.CreateExecutionType(ctx, req)
	if err != nil {
		t.Fatalf("Failed to create ExecutionType with request %v: %v", req, err)
	}

	tests := []struct {
		request    string
		wantStored string
	}{
		{
			request: ` execution {
				name: "My Pipeline"
				workspace: { name: "my workspace" }
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }} }
			   parent: "execution_types/kubeflow.org/v1/MyPipeline" `,
			wantStored: `
				properties { key: "__kf_workspace" value { string_value: "my workspace" }}
				properties { key: "__kf_execution_name" value { string_value: "My Pipeline" }}
				properties { key: "__kf_create_time" value { int_value: 123 }}
				properties { key: "__kf_update_time" value { int_value: 123 }}
				properties { key: "string_field" value { string_value: "string value" }}
				properties { key: "int_field" value { int_value: 100 }}
				properties { key: "double_field" value { double_value: 1.1 }}
				custom_properties { key: "custom_string_field" value { string_value: "custom string value" }}
				custom_properties { key: "custom_int_field" value { int_value: 200 }}
				custom_properties { key: "custom_double_field" value { double_value: 2.2 }}
			`,
		},
		// TODO(neuromage): Add more test cases.
	}

	for i, test := range tests {
		req := &pb.CreateExecutionRequest{}
		if err := proto.UnmarshalText(test.request, req); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}
		want := proto.Clone(req.Execution).(*pb.Execution)
		want.CreateTime = proto.Clone(tsProto).(*timestamp.Timestamp)
		want.UpdateTime = proto.Clone(tsProto).(*timestamp.Timestamp)

		want.StartTime = proto.Clone(tsProtoZero).(*timestamp.Timestamp)
		want.EndTime = proto.Clone(tsProtoZero).(*timestamp.Timestamp)

		response, err := svc.CreateExecution(ctx, req)
		if err != nil {
			t.Errorf("Test case %d\nCreateExecution\nRequest:\n%v\nGot error:\n%v\nWant nil error\n", i, req, err)
			continue
		}

		got := response.Execution

		if !cmp.Equal(got, want, cmpopts.IgnoreFields(pb.Execution{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nCreateExecution\nRequest:\n%v\nGot:\n%v\nError:\n%v\nWant:\n%v\nDiff\n%v\n",
				i, req, got, err, want, cmp.Diff(want, got))
		}

		wantStored := &mlpb.Execution{}
		if err := proto.UnmarshalText(test.wantStored, wantStored); err != nil {
			t.Errorf("Test case %d\nproto.UnmarshalText failure: %v ", i, err)
			continue
		}

		gotStored, err := store.GetExecutionsByID([]mlmetadata.ExecutionID{mlmetadata.ExecutionID(got.GetId())})
		if err != nil || len(gotStored) != 1 {
			t.Errorf("Test case %d\nstore.GetExecution:\n%v, %v\nWant single Execution and nil error\n", i, gotStored, err)
			continue
		}

		if !cmp.Equal(gotStored[0], wantStored, cmpopts.IgnoreFields(mlpb.Execution{}, "Id", "TypeId")) {
			t.Errorf("Test case %d\nStored Execution:\n%v\nWant:\n%v\nDiff:\n%s",
				i, gotStored[0], wantStored, cmp.Diff(wantStored, gotStored[0]))
		}
	}
}
