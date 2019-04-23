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

	pb "github.com/kubeflow/metadata/api"
	"github.com/kubeflow/metadata/schemaparser"
)

// Service implements the gRPC service MetadataService defined in the metadata
// API spec.
type Service struct {
	schemaset schemaparser.SchemaSet
}

// NewService returns a metadata server
func NewService(schemaRootDir string) (*Service, error) {
	ss, err := schemaparser.NewSchemaSetFromADir(schemaRootDir)
	if err != nil {
		return nil, err
	}
	return &Service{
		schemaset: ss,
	}, nil
}

// GetResource returns the specified resource in the request.
func (s *Service) GetResource(ctx context.Context, in *pb.GetResourceRequest) (*pb.Resource, error) {
	if in.Name == "" {
		return nil, errors.New("must specify name")
	}

	return &pb.Resource{Name: in.Name}, nil
}
