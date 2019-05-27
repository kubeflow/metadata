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
	"time"

	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes"
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

var timeNowFn = time.Now

const (
	kfReservedPrefix = "__kf_"
	kfWorkspace      = "__kf_workspace"
	kfNamespace      = "__kf_namespace"
	kfDescription    = "__kf_description"

	kfCreateTime   = "__kf_create_time"
	kfUpdateTime   = "__kf_update_time"
	kfArtifactName = "__kf_artifact_name"

	kfDefaultNamespace = "types.kubeflow.org/default"
	kfDefaultWorkspace = "__kf_default_workspace"
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
		Id: proto.Int64(in.Id),
		Properties: map[string]mlpb.PropertyType{
			kfArtifactName: mlpb.PropertyType_STRING,
			kfWorkspace:    mlpb.PropertyType_STRING,
			kfCreateTime:   mlpb.PropertyType_INT,
			kfUpdateTime:   mlpb.PropertyType_INT,
		},
	}

	for k, v := range in.Properties {
		if strings.HasPrefix(k, kfReservedPrefix) {
			return nil, fmt.Errorf("field %q uses system-reserved prefix %q", k, kfReservedPrefix)
		}

		switch v {
		case pb.PropertyType_INT:
			res.Properties[k] = mlpb.PropertyType_INT
		case pb.PropertyType_DOUBLE:
			res.Properties[k] = mlpb.PropertyType_DOUBLE
		case pb.PropertyType_STRING:
			res.Properties[k] = mlpb.PropertyType_STRING
		default:
			return nil, fmt.Errorf("Property %q has invalid type %T", k, v)
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
		Id:         in.GetId(),
		Properties: make(map[string]pb.PropertyType),
	}

	for k, v := range in.Properties {
		if strings.HasPrefix(k, kfReservedPrefix) {
			continue
		}

		switch v {
		case mlpb.PropertyType_INT:
			res.Properties[k] = pb.PropertyType_INT
		case mlpb.PropertyType_DOUBLE:
			res.Properties[k] = pb.PropertyType_DOUBLE
		case mlpb.PropertyType_STRING:
			res.Properties[k] = pb.PropertyType_STRING
		default:
			return nil, fmt.Errorf("Property %q has invalid type %T", k, v)
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

func setStoredProperty(props map[string]*mlpb.Value, k string, v interface{}) error {
	switch x := v.(type) {
	case int, int32, int64:
		vv := v.(int64)
		props[k] = &mlpb.Value{
			Value: &mlpb.Value_IntValue{
				IntValue: vv,
			},
		}

	case float32, float64:
		vv := v.(float64)
		props[k] = &mlpb.Value{
			Value: &mlpb.Value_DoubleValue{
				DoubleValue: vv,
			},
		}

	case string:
		vv := v.(string)
		props[k] = &mlpb.Value{
			Value: &mlpb.Value_StringValue{
				StringValue: vv,
			},
		}

	default:
		return fmt.Errorf("property %q has invalid type %T", k, x)
	}

	return nil
}

func setProperty(props map[string]*pb.Value, k string, v interface{}) error {
	switch x := v.(type) {
	case int, int32, int64:
		vv := v.(int64)
		props[k] = &pb.Value{
			Value: &pb.Value_IntValue{
				IntValue: vv,
			},
		}

	case float32, float64:
		vv := v.(float64)
		props[k] = &pb.Value{
			Value: &pb.Value_DoubleValue{
				DoubleValue: vv,
			},
		}

	case string:
		vv := v.(string)
		props[k] = &pb.Value{
			Value: &pb.Value_StringValue{
				StringValue: vv,
			},
		}

	default:
		return fmt.Errorf("property %q has invalid type %T", k, x)
	}

	return nil
}

func setStoredPropertyMap(in map[string]*pb.Value, stored map[string]*mlpb.Value) error {
	for k, v := range in {
		if strings.HasPrefix(k, kfReservedPrefix) {
			return fmt.Errorf("field %q uses system-reserved prefix %q", k, kfReservedPrefix)
		}

		var err error
		switch x := v.Value.(type) {
		case *pb.Value_IntValue:
			err = setStoredProperty(stored, k, v.GetIntValue())

		case *pb.Value_DoubleValue:
			err = setStoredProperty(stored, k, v.GetDoubleValue())

		case *pb.Value_StringValue:
			err = setStoredProperty(stored, k, v.GetStringValue())

		default:
			err = fmt.Errorf("property %q has invalid type %T", k, x)
		}

		if err != nil {
			return err
		}
	}
	return nil
}

func toStoredArtifact(in *pb.Artifact) (*mlpb.Artifact, error) {
	stored := &mlpb.Artifact{
		TypeId:           proto.Int64(in.GetTypeId()),
		Uri:              proto.String(in.GetUri()),
		Properties:       make(map[string]*mlpb.Value),
		CustomProperties: make(map[string]*mlpb.Value),
	}
	if in.GetId() > 0 {
		stored.Id = proto.Int64(in.GetId())
	}

	if err := setStoredPropertyMap(in.Properties, stored.Properties); err != nil {
		return nil, err
	}

	if err := setStoredPropertyMap(in.CustomProperties, stored.CustomProperties); err != nil {
		return nil, err
	}

	if in.GetName() != "" {
		setStoredProperty(stored.Properties, kfArtifactName, in.GetName())
	}

	workspace := kfDefaultWorkspace
	if in.GetWorkspace().GetName() != "" {
		workspace = in.GetWorkspace().GetName()
	}
	if err := setStoredProperty(stored.Properties, kfWorkspace, workspace); err != nil {
		return nil, err
	}

	createTime, err := ptypes.Timestamp(in.GetCreateTime())
	if err != nil {
		return nil, fmt.Errorf("internal error: invalid create time: %v", err)
	}
	if err := setStoredProperty(stored.Properties, kfCreateTime, createTime.Unix()); err != nil {
		return nil, err
	}

	updateTime, err := ptypes.Timestamp(in.GetUpdateTime())
	if err != nil {
		return nil, fmt.Errorf("internal error: invalid update time: %v", err)
	}
	if err := setStoredProperty(stored.Properties, kfUpdateTime, updateTime.Unix()); err != nil {
		return nil, err
	}

	return stored, nil
}

func setPropertyMapFromStored(stored map[string]*mlpb.Value, out map[string]*pb.Value) error {
	for k, v := range stored {
		if strings.HasPrefix(k, kfReservedPrefix) {
			continue
		}

		var err error
		switch x := v.Value.(type) {
		case *mlpb.Value_IntValue:
			err = setProperty(out, k, v.GetIntValue())

		case *mlpb.Value_DoubleValue:
			err = setProperty(out, k, v.GetDoubleValue())

		case *mlpb.Value_StringValue:
			err = setProperty(out, k, v.GetStringValue())

		default:
			err = fmt.Errorf("property %q has invalid type %T", k, x)
		}

		if err != nil {
			return err
		}
	}
	return nil
}

func toArtifact(in *mlpb.Artifact) (*pb.Artifact, error) {
	out := &pb.Artifact{
		Id:               in.GetId(),
		TypeId:           in.GetTypeId(),
		Uri:              in.GetUri(),
		Properties:       make(map[string]*pb.Value),
		CustomProperties: make(map[string]*pb.Value),
	}

	var err error
	createTime := in.Properties[kfCreateTime].GetIntValue()
	out.CreateTime, err = ptypes.TimestampProto(time.Unix(createTime, 0))
	if err != nil {
		return nil, err
	}

	updateTime := in.Properties[kfUpdateTime].GetIntValue()
	out.UpdateTime, err = ptypes.TimestampProto(time.Unix(updateTime, 0))
	if err != nil {
		return nil, err
	}

	out.Name = in.Properties[kfArtifactName].GetStringValue()
	out.Workspace = &pb.Workspace{Name: in.Properties[kfWorkspace].GetStringValue()}

	if err := setPropertyMapFromStored(in.Properties, out.Properties); err != nil {
		return nil, err
	}

	if err := setPropertyMapFromStored(in.CustomProperties, out.CustomProperties); err != nil {
		return nil, err
	}

	return out, nil
}

func (s *Service) getStoredArtifact(id int64) (*pb.Artifact, error) {
	ids, err := s.store.GetArtifactsByID([]mlmetadata.ArtifactID{mlmetadata.ArtifactID(id)})
	if err != nil {
		return nil, err
	}

	if len(ids) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Artifact id, got instead : %v", ids)
	}

	return toArtifact(ids[0])
}

// CreateArtifact creates a new artifact.
func (s *Service) CreateArtifact(ctx context.Context, req *pb.CreateArtifactRequest) (*pb.CreateArtifactResponse, error) {
	if req.Artifact == nil {
		return nil, errors.New("unspecified Artifact")
	}

	if req.Artifact.Id > 0 {
		return nil, errors.New("id should remain unspecified when creating Artifact")
	}

	now, err := ptypes.TimestampProto(timeNowFn())
	if err != nil {
		return nil, fmt.Errorf("internal error: failed to generate valid timestamp: %v", err)
	}
	req.Artifact.CreateTime = now
	req.Artifact.UpdateTime = now

	stored, err := toStoredArtifact(req.Artifact)
	if err != nil {
		return nil, err
	}

	ids, err := s.store.PutArtifacts([]*mlpb.Artifact{stored})
	if err != nil {
		return nil, err
	}

	if len(ids) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Artifact id, got instead : %v", ids)
	}

	artifact, err := s.getStoredArtifact(int64(ids[0]))
	if err != nil {
		return nil, err
	}

	return &pb.CreateArtifactResponse{Artifact: artifact}, nil
}

// GetArtifact returns the requested artifact.
func (s *Service) GetArtifact(ctx context.Context, req *pb.GetArtifactRequest) (*pb.GetArtifactResponse, error) {
	artifact, err := s.getStoredArtifact(req.GetId())
	if err != nil {
		return nil, err
	}

	return &pb.GetArtifactResponse{Artifact: artifact}, nil
}

// ListArtifacts lists all known artifacts.
func (s *Service) ListArtifacts(ctx context.Context, req *pb.ListArtifactsRequest) (*pb.ListArtifactsResponse, error) {
	storedArtifacts, err := s.store.GetArtifacts()
	if err != nil {
		return nil, err
	}

	var artifacts []*pb.Artifact
	for _, stored := range storedArtifacts {
		artifact, err := toArtifact(stored)
		if err != nil {
			return nil, err
		}
		artifacts = append(artifacts, artifact)
	}

	return &pb.ListArtifactsResponse{Artifacts: artifacts}, nil
}

// DeleteArtifact deletes the specified artifact.
func (s *Service) DeleteArtifact(ctx context.Context, req *pb.DeleteArtifactRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteArtifact")
}
