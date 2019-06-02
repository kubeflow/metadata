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
	"strconv"
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
// TODO(neuromage): All the handlers work synchronously. If DB lookups result in
// problems later down the road, consider plumbing context through to the
// underlying MLMD store and handling timeouts and cancelation gracefully.
func New(store MetadataStore) *Service {
	return &Service{store: store}
}

// Close cleans up and frees resources held by Service.
func (s *Service) Close() {
	s.Close()
}

const (
	kfReservedPrefix = "__kf_"
	kfWorkspace      = "__kf_workspace"
	kfNamespace      = "__kf_namespace"
	kfDescription    = "__kf_description"

	kfCreateTime = "__kf_create_time"
	kfUpdateTime = "__kf_update_time"
	kfStartTime  = "__kf_start_time"
	kfEndTime    = "__kf_end_time"

	kfArtifactName  = "__kf_artifact_name"
	kfExecutionName = "__kf_execution_name"

	kfDefaultNamespace = "types.kubeflow.org/default"
	kfDefaultWorkspace = "__kf_default_workspace"

	artifactTypesCollection  = "artifact_types/"
	artifactCollection       = "artifacts/"
	executionTypesCollection = "execution_types/"
	executionCollection      = "executions/"
)

var (
	timeNowFn        = time.Now
	validTypeNameRE  = regexp.MustCompile(`^[A-Za-z][^ /]*$`)
	validNamespaceRE = regexp.MustCompile(`^[A-Za-z][^ ]*[^/]$`)
	artifactNameRE   = regexp.MustCompile(`artifact_types/.*/artifacts/([0-9]+)`)
	executionNameRE  = regexp.MustCompile(`execution_types/.*/executions/([0-9]+)`)
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

func toStoredArtifactType(in *pb.ArtifactType) (*mlpb.ArtifactType, error) {
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

	name, err := getNamespacedName(in.Name)
	if err != nil {
		return nil, err
	}

	res.Name = proto.String(name)

	return res, nil
}

// getNamespacedName checks that n is a valid name of the type
// `{namespace}/{name}`. If {namespace} is empty, the default one
// (kfDefaultNamespace) is used instead. Both {namespace} and {name} should
// start with an alphabet and not contain spaces. Returns the (possibly
// modified) fully-qualified name, or an error if n is malformed or empty.
func getNamespacedName(n string) (string, error) {
	ns := strings.Split(n, "/")
	if len(ns) == 0 {
		return "", fmt.Errorf("malformed type name: %q", n)
	}

	name := ns[len(ns)-1]
	if len(name) == 0 {
		return "", fmt.Errorf("empty type name: %q", n)
	}

	namespace := kfDefaultNamespace
	if len(ns) > 1 {
		namespace = strings.Join(ns[0:len(ns)-1], "/")
	}

	if err := validNamespace(namespace); err != nil {
		return "", err
	}

	if err := validTypeName(name); err != nil {
		return "", err
	}

	return namespace + "/" + name, nil
}

func toArtifactType(in *mlpb.ArtifactType) (*pb.ArtifactType, error) {
	res := &pb.ArtifactType{
		Id:         in.GetId(),
		Name:       in.GetName(),
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

	return res, nil
}

func (s *Service) getArtifactType(name string) (*pb.ArtifactType, error) {
	name = strings.TrimPrefix(name, artifactTypesCollection)
	storedTypes, err := s.store.GetArtifactType(name)
	if err != nil {
		return nil, err
	}
	return toArtifactType(storedTypes)
}

// CreateArtifactType creates a new artifact type.
func (s *Service) CreateArtifactType(ctx context.Context, req *pb.CreateArtifactTypeRequest) (*pb.CreateArtifactTypeResponse, error) {
	storedType, err := toStoredArtifactType(req.GetArtifactType())
	if err != nil {
		return nil, err
	}
	// Clear id for creation.
	storedType.Id = nil

	_, err = s.store.PutArtifactType(
		storedType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	aType, err := s.getArtifactType(storedType.GetName())
	if err != nil {
		return nil, err
	}

	return &pb.CreateArtifactTypeResponse{
		ArtifactType: aType,
	}, nil
}

// GetArtifactType returns the requested artifact type.
func (s *Service) GetArtifactType(ctx context.Context, req *pb.GetArtifactTypeRequest) (*pb.GetArtifactTypeResponse, error) {
	aType, err := s.getArtifactType(req.GetName())
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

func (s *Service) getStoredArtifact(name string) (*pb.Artifact, error) {
	tokens := artifactNameRE.FindStringSubmatch(name)
	if len(tokens) != 2 {
		return nil, fmt.Errorf("malformed Artifact name %q. Must match pattern %q", name, artifactNameRE)
	}

	id, err := strconv.ParseInt(tokens[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Artifact id from %q: %v", tokens[1], err)
	}
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

	aType, err := s.getArtifactType(req.Parent)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve ArtifactType under %q: %v", req.Parent, err)
	}

	req.Artifact.TypeId = aType.GetId()
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

	artifactName := fmt.Sprintf("%s/artifacts/%d", req.Parent, ids[0])
	artifact, err := s.getStoredArtifact(artifactName)
	if err != nil {
		return nil, err
	}

	return &pb.CreateArtifactResponse{Artifact: artifact}, nil
}

// GetArtifact returns the requested artifact.
func (s *Service) GetArtifact(ctx context.Context, req *pb.GetArtifactRequest) (*pb.GetArtifactResponse, error) {
	artifact, err := s.getStoredArtifact(req.GetName())
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

func toStoredExecutionType(in *pb.ExecutionType) (*mlpb.ExecutionType, error) {
	res := &mlpb.ExecutionType{
		Id: proto.Int64(in.Id),
		Properties: map[string]mlpb.PropertyType{
			kfExecutionName: mlpb.PropertyType_STRING,
			kfWorkspace:     mlpb.PropertyType_STRING,
			kfCreateTime:    mlpb.PropertyType_INT,
			kfUpdateTime:    mlpb.PropertyType_INT,
			kfStartTime:     mlpb.PropertyType_INT,
			kfEndTime:       mlpb.PropertyType_INT,
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

	name, err := getNamespacedName(in.Name)
	if err != nil {
		return nil, err
	}

	res.Name = proto.String(name)

	return res, nil
}

func toExecutionType(in *mlpb.ExecutionType) (*pb.ExecutionType, error) {
	res := &pb.ExecutionType{
		Id:         in.GetId(),
		Name:       in.GetName(),
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

	return res, nil
}

func toStoredExecution(in *pb.Execution) (*mlpb.Execution, error) {
	stored := &mlpb.Execution{
		TypeId:           proto.Int64(in.GetTypeId()),
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
		setStoredProperty(stored.Properties, kfExecutionName, in.GetName())
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

	if in.StartTime != nil {
		startTime, err := ptypes.Timestamp(in.GetStartTime())
		if err != nil {
			return nil, fmt.Errorf("internal error: invalid start time: %v", err)
		}
		if err := setStoredProperty(stored.Properties, kfStartTime, startTime.Unix()); err != nil {
			return nil, err
		}
	}

	if in.EndTime != nil {
		endTime, err := ptypes.Timestamp(in.GetEndTime())
		if err != nil {
			return nil, fmt.Errorf("internal error: invalid end time: %v", err)
		}
		if err := setStoredProperty(stored.Properties, kfEndTime, endTime.Unix()); err != nil {
			return nil, err
		}
	}

	return stored, nil
}

func (s *Service) getStoredExecutionType(name string) (*pb.ExecutionType, error) {
	name = strings.TrimPrefix(name, executionTypesCollection)
	storedType, err := s.store.GetExecutionType(name)
	if err != nil {
		return nil, err
	}
	return toExecutionType(storedType)
}

// CreateExecutionType creates the specified execution type.
func (s *Service) CreateExecutionType(ctx context.Context, req *pb.CreateExecutionTypeRequest) (*pb.CreateExecutionTypeResponse, error) {
	storedType, err := toStoredExecutionType(req.GetExecutionType())
	if err != nil {
		return nil, err
	}
	// Clear id for creation.
	storedType.Id = nil

	_, err = s.store.PutExecutionType(storedType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	aType, err := s.getStoredExecutionType(storedType.GetName())
	if err != nil {
		return nil, err
	}

	return &pb.CreateExecutionTypeResponse{
		ExecutionType: aType,
	}, nil
}

// GetExecutionType return the specified execution type.
func (s *Service) GetExecutionType(ctx context.Context, req *pb.GetExecutionTypeRequest) (*pb.GetExecutionTypeResponse, error) {
	eType, err := s.getStoredExecutionType(req.GetName())
	if err != nil {
		return nil, err
	}

	return &pb.GetExecutionTypeResponse{
		ExecutionType: eType,
	}, nil
}

// ListExecutionTypes lists all execution types.
func (s *Service) ListExecutionTypes(ctx context.Context, req *pb.ListExecutionTypesRequest) (*pb.ListExecutionTypesResponse, error) {
	return nil, nil
}

// DeleteExecutionType deletes the specified execution.
func (s *Service) DeleteExecutionType(ctx context.Context, req *pb.DeleteExecutionTypeRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteExecutionType")
}

func toExecution(in *mlpb.Execution) (*pb.Execution, error) {
	out := &pb.Execution{
		Id:               in.GetId(),
		TypeId:           in.GetTypeId(),
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

	startTime := in.Properties[kfStartTime].GetIntValue()
	out.StartTime, err = ptypes.TimestampProto(time.Unix(startTime, 0))
	if err != nil {
		return nil, err
	}

	endTime := in.Properties[kfEndTime].GetIntValue()
	out.EndTime, err = ptypes.TimestampProto(time.Unix(endTime, 0))
	if err != nil {
		return nil, err
	}

	out.Name = in.Properties[kfExecutionName].GetStringValue()
	out.Workspace = &pb.Workspace{Name: in.Properties[kfWorkspace].GetStringValue()}

	if err := setPropertyMapFromStored(in.Properties, out.Properties); err != nil {
		return nil, err
	}

	if err := setPropertyMapFromStored(in.CustomProperties, out.CustomProperties); err != nil {
		return nil, err
	}

	return out, nil
}
func (s *Service) getStoredExecution(name string) (*pb.Execution, error) {
	tokens := executionNameRE.FindStringSubmatch(name)
	if len(tokens) != 2 {
		return nil, fmt.Errorf("malformed Execution name %q. Must match pattern %q", name, executionNameRE)
	}

	id, err := strconv.ParseInt(tokens[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Execution id from %q: %v", tokens[1], err)
	}
	ids, err := s.store.GetExecutionsByID([]mlmetadata.ExecutionID{mlmetadata.ExecutionID(id)})
	if err != nil {
		return nil, err
	}

	if len(ids) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Execution id, got instead : %v", ids)
	}

	return toExecution(ids[0])
}

// CreateExecution creates the specified execution.
func (s *Service) CreateExecution(ctx context.Context, req *pb.CreateExecutionRequest) (*pb.CreateExecutionResponse, error) {
	if req.Execution == nil {
		return nil, errors.New("unspecified Execution")
	}

	if req.Execution.Id > 0 {
		return nil, errors.New("id should remain unspecified when creating Execution")
	}

	now, err := ptypes.TimestampProto(timeNowFn())
	if err != nil {
		return nil, fmt.Errorf("internal error: failed to generate valid timestamp: %v", err)
	}
	req.Execution.CreateTime = now
	req.Execution.UpdateTime = now

	eType, err := s.getStoredExecutionType(req.Parent)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve ExecutionType under %q: %v", req.Parent, err)
	}

	req.Execution.TypeId = eType.GetId()
	stored, err := toStoredExecution(req.Execution)
	if err != nil {
		return nil, err
	}

	ids, err := s.store.PutExecutions([]*mlpb.Execution{stored})
	if err != nil {
		return nil, err
	}

	if len(ids) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Execution id, got instead : %v", ids)
	}

	executionName := fmt.Sprintf("%s/executions/%d", req.Parent, ids[0])
	exec, err := s.getStoredExecution(executionName)
	if err != nil {
		return nil, err
	}

	return &pb.CreateExecutionResponse{Execution: exec}, nil

}

// GetExecution returns the specified execution.
func (s *Service) GetExecution(ctx context.Context, req *pb.GetExecutionRequest) (*pb.GetExecutionResponse, error) {
	exec, err := s.getStoredExecution(req.GetName())
	if err != nil {
		return nil, err
	}

	return &pb.GetExecutionResponse{Execution: exec}, nil
}

// ListExecutions returns all executions.
func (s *Service) ListExecutions(ctx context.Context, req *pb.ListExecutionsRequest) (*pb.ListExecutionsResponse, error) {
	return nil, nil
}

// DeleteExecution deletes the specified execution.
func (s *Service) DeleteExecution(ctx context.Context, req *pb.DeleteExecutionRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteExecution")
}
