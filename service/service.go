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
	"regexp"
	"strings"

	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/kubeflow/metadata/api"
)

// Service implements the gRPC service MetadataService defined in the metadata
// API spec.
type Service struct {
	store MetadataStore
}

// New returns a new instance of Service.
func New(store MetadataStore) *Service {
	return &Service{store: store}
}

// Close cleans up and frees resources held by Service.
func (s *Service) Close() {
	s.Close()
}

const (
	kfWorkspace   = "__kf_workspace"
	kfNamespace   = "__kf_namespace"
	kfDescription = "__kf_description"

	kfDefaultNamespace = "types.kubeflow.org/default"
)

var (
	validTypeNameRE  = regexp.MustCompile(`^[A-Za-z][^ /]*$`)
	validNamespaceRE = regexp.MustCompile(`^[A-Za-z][^ ]*[^/]$`)
)

func validTypeName(n string) error {
	if validTypeNameRE.MatchString(n) {
		return nil
	}

	return fmt.Errorf("invalid type name %q: type names must begin with an alphabet and not contain spaces or slashes", n)
}

func validNamespace(n string) error {
	if validNamespaceRE.MatchString(n) {
		return nil
	}

	return fmt.Errorf("invalid namespace %q: namespaces must begin with an alphabet, should not contain spaces, or end with a trailing /", n)
}

func toMLMDArtifactType(in *pb.ArtifactType) (*mlpb.ArtifactType, error) {
	res := &mlpb.ArtifactType{
		Id:         proto.Int64(in.Id),
		Properties: make(map[string]mlpb.PropertyType),
	}

	for k, v := range in.TypeProperties {
		if strings.HasPrefix(k, "kf_") {
			return nil, fmt.Errorf("type property %q uses system-reserved prefix '__kf_'", k)
		}

		switch x := v.Type.(type) {
		case *pb.Type_IntType:
			res.Properties[k] = mlpb.PropertyType_INT
		case *pb.Type_DoubleType:
			res.Properties[k] = mlpb.PropertyType_DOUBLE
		case *pb.Type_StringType:
			res.Properties[k] = mlpb.PropertyType_STRING
		default:
			return nil, fmt.Errorf("Property %q has invalid type %T", k, x)
		}
	}

	namespace := kfDefaultNamespace
	if in.Namespace != nil && in.Namespace.Name != "" {
		namespace = in.Namespace.Name
	}

	if err := validNamespace(namespace); err != nil {
		return nil, err
	}

	if err := validTypeName(in.Name); err != nil {
		return nil, err
	}

	storedName := namespace + "/" + in.Name
	res.Name = proto.String(storedName)

	return res, nil
}

func getNamespacedName(n string) (string, string, error) {
	ns := strings.Split(n, "/")
	if len(ns) < 2 {
		return "", "", fmt.Errorf("malformed type name: %q", n)
	}

	name := ns[len(ns)-1]
	if len(name) == 0 {
		return "", "", fmt.Errorf("malformed type name: %q", n)
	}

	namespace := strings.Join(ns[0:len(ns)-1], "/")
	return namespace, name, nil
}

func toArtifactType(in *mlpb.ArtifactType) (*pb.ArtifactType, error) {
	res := &pb.ArtifactType{
		Id:             in.GetId(),
		TypeProperties: make(map[string]*pb.Type),
	}

	for k, v := range in.Properties {
		switch v {
		case mlpb.PropertyType_INT:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_IntType{&pb.IntType{}}}
		case mlpb.PropertyType_DOUBLE:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_DoubleType{&pb.DoubleType{}}}
		case mlpb.PropertyType_STRING:
			res.TypeProperties[k] = &pb.Type{Type: &pb.Type_StringType{&pb.StringType{}}}
		}
	}

	namespace, name, err := getNamespacedName(in.GetName())
	if err != nil {
		return nil, err
	}

	res.Namespace = &pb.Namespace{Name: namespace}
	res.Name = name

	return res, nil
}

func (s *Service) getArtifactTypeByID(id int64) (*pb.ArtifactType, error) {
	storedTypes, err := s.store.GetArtifactTypesByID([]mlmetadata.ArtifactTypeID{mlmetadata.ArtifactTypeID(id)})
	if err != nil {
		return nil, err
	}
	if len(storedTypes) != 1 {
		return nil, fmt.Errorf("failed to get artifact type with id %d", id)
	}

	return toArtifactType(storedTypes[0])
}

// CreateArtifactType creates a new artifact type.
func (s *Service) CreateArtifactType(ctx context.Context, req *pb.CreateArtifactTypeRequest) (*pb.CreateArtifactTypeResponse, error) {
	storedType, err := toMLMDArtifactType(req.GetArtifactType())
	if err != nil {
		return nil, err
	}
	// Clear id for creation.
	storedType.Id = nil

	id, err := s.store.PutArtifactType(
		storedType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	aType, err := s.getArtifactTypeByID(int64(id))
	if err != nil {
		return nil, err
	}

	return &pb.CreateArtifactTypeResponse{
		ArtifactType: aType,
	}, nil
}

// GetArtifactType returns the requested artifact type.
func (s *Service) GetArtifactType(ctx context.Context, req *pb.GetArtifactTypeRequest) (*pb.GetArtifactTypeResponse, error) {
	aType, err := s.getArtifactTypeByID(req.GetId())
	if err != nil {
		return nil, err
	}

	return &pb.GetArtifactTypeResponse{
		ArtifactType: aType,
	}, nil
}

// ListArtifactTypes lists all artifact types.
func (s *Service) ListArtifactTypes(ctx context.Context, req *pb.ListArtifactTypesRequest) (*pb.ListArtifactTypesResponse, error) {
	storedTypes, err := s.store.GetArtifactTypesByID(nil)
	if err != nil {
		return nil, err
	}

	res := &pb.ListArtifactTypesResponse{}

	for _, storedType := range storedTypes {
		aType, err := toArtifactType(storedType)
		if err != nil {
			return nil, err
		}
		res.ArtifactTypes = append(res.ArtifactTypes, aType)
	}
	return res, nil
}

// DeleteArtifactType deletes the specified artifact type.
func (s *Service) DeleteArtifactType(ctx context.Context, req *pb.DeleteArtifactTypeRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteArtifactType")
}
