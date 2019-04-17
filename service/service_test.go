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

	"github.com/google/go-cmp/cmp"
	pb "github.com/kubeflow/metadata/api"
)

func TestGetResourceWithName(t *testing.T) {
	in := &pb.GetResourceRequest{Name: "some-resource"}
	want := &pb.Resource{Name: "some-resource"}
	svc := &Service{}
	got, err := svc.GetResource(context.Background(), in)
	if !cmp.Equal(got, want) || err != nil {
		t.Errorf("GetResource(%+v) = %+v, %v\nWant %+v, nil", in, got, err, want)
	}
}

func TestGetResourceWithoutName(t *testing.T) {
	in := &pb.GetResourceRequest{}
	svc := &Service{}
	got, err := svc.GetResource(context.Background(), in)
	if err == nil {
		t.Errorf("GetResource(%+v) = %+v, %v\nWant _, non-nil error", in, got, err)
	}
}
