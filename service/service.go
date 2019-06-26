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
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/kubeflow/metadata/api"
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

func (s *Service) getArtifactType(name string) (*mlpb.ArtifactType, error) {
	name = strings.TrimPrefix(name, artifactTypesCollection)
	return s.store.GetArtifactType(name)
}

// CreateArtifactType creates a new artifact type.
func (s *Service) CreateArtifactType(ctx context.Context, req *api.CreateArtifactTypeRequest) (*api.CreateArtifactTypeResponse, error) {
	if req.ArtifactType == nil {
		return nil, errors.New("no ArtifactType specified")
	}

	_, err := s.store.PutArtifactType(
		req.ArtifactType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	aType, err := s.getArtifactType(req.ArtifactType.GetName())
	if err != nil {
		return nil, err
	}

	return &api.CreateArtifactTypeResponse{
		ArtifactType: aType,
	}, nil
}

// GetArtifactType returns the requested artifact type.
func (s *Service) GetArtifactType(ctx context.Context, req *api.GetArtifactTypeRequest) (*api.GetArtifactTypeResponse, error) {
	aType, err := s.getArtifactType(req.GetName())
	if err != nil {
		return nil, err
	}

	return &api.GetArtifactTypeResponse{
		ArtifactType: aType,
	}, nil
}

// ListArtifactTypes lists all artifact types.
func (s *Service) ListArtifactTypes(ctx context.Context, req *api.ListArtifactTypesRequest) (*api.ListArtifactTypesResponse, error) {
	// TODO(neuromage): Implement ListArtifactTypes in MLMD ASAP.
	// Assume at most 1K types (ugh!).
	var typeIDs []mlmetadata.ArtifactTypeID
	for i := 0; i < 1000; i++ {
		typeIDs = append(typeIDs, mlmetadata.ArtifactTypeID(i))
	}

	aTypes, err := s.store.GetArtifactTypesByID(typeIDs)
	if err != nil {
		return nil, err
	}

	res := &api.ListArtifactTypesResponse{}
	for _, aType := range aTypes {
		res.ArtifactTypes = append(res.ArtifactTypes, aType)
	}

	return res, nil
}

// DeleteArtifactType deletes the specified artifact type.
func (s *Service) DeleteArtifactType(ctx context.Context, req *api.DeleteArtifactTypeRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteArtifactType")
}

func (s *Service) getStoredArtifact(name string) (*mlpb.Artifact, error) {
	tokens := artifactNameRE.FindStringSubmatch(name)
	if len(tokens) != 2 {
		return nil, fmt.Errorf("malformed Artifact name %q. Must match pattern %q", name, artifactNameRE)
	}

	id, err := strconv.ParseInt(tokens[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Artifact id from %q: %v", tokens[1], err)
	}

	artifacts, err := s.store.GetArtifactsByID([]mlmetadata.ArtifactID{mlmetadata.ArtifactID(id)})
	if err != nil {
		return nil, err
	}

	if len(artifacts) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Artifact id, got instead : %v", artifacts)
	}

	return artifacts[0], nil
}

// CreateArtifact creates a new artifact.
func (s *Service) CreateArtifact(ctx context.Context, req *api.CreateArtifactRequest) (*api.CreateArtifactResponse, error) {
	if req.Artifact == nil {
		return nil, errors.New("unspecified Artifact")
	}

	if req.Artifact.Id != nil {
		return nil, errors.New("id should remain unspecified when creating Artifact")
	}

	aType, err := s.getArtifactType(req.Parent)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve ArtifactType under %q: %v", req.Parent, err)
	}

	req.Artifact.TypeId = proto.Int64(aType.GetId())

	ids, err := s.store.PutArtifacts([]*mlpb.Artifact{req.Artifact})
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

	return &api.CreateArtifactResponse{Artifact: artifact}, nil
}

// GetArtifact returns the requested artifact.
func (s *Service) GetArtifact(ctx context.Context, req *api.GetArtifactRequest) (*api.GetArtifactResponse, error) {
	artifact, err := s.getStoredArtifact(req.GetName())
	if err != nil {
		return nil, err
	}

	return &api.GetArtifactResponse{Artifact: artifact}, nil
}

// ListArtifacts lists all known artifacts if artfact type name is not set or lists all artifacts of a given type name.
func (s *Service) ListArtifacts(ctx context.Context, req *api.ListArtifactsRequest) (*api.ListArtifactsResponse, error) {
	var err error
	var artifacts []*mlpb.Artifact
	if req.Name == "" {
		// Return all artifacts.
		artifacts, err = s.store.GetArtifacts()
	} else {
		typeName := strings.TrimPrefix(req.Name, artifactTypesCollection)
		artifacts, err = s.store.GetArtifactsByType(typeName)
	}

	if err != nil {
		// An empty list is returned if no artifact is found.
		if err.Error() != "Cannot find any record" {
			return nil, err
		}
		artifacts = []*mlpb.Artifact{}
	}

	return &api.ListArtifactsResponse{Artifacts: artifacts}, nil
}

// DeleteArtifact deletes the specified artifact.
func (s *Service) DeleteArtifact(ctx context.Context, req *api.DeleteArtifactRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteArtifact")
}

func (s *Service) getExecutionType(name string) (*mlpb.ExecutionType, error) {
	name = strings.TrimPrefix(name, executionTypesCollection)
	return s.store.GetExecutionType(name)
}

// CreateExecutionType creates the specified execution type.
func (s *Service) CreateExecutionType(ctx context.Context, req *api.CreateExecutionTypeRequest) (*api.CreateExecutionTypeResponse, error) {
	if req.ExecutionType == nil {
		return nil, errors.New("no ExecutionType specified")
	}

	_, err := s.store.PutExecutionType(req.ExecutionType, &mlmetadata.PutTypeOptions{AllFieldsMustMatch: true})
	if err != nil {
		return nil, err
	}

	eType, err := s.getExecutionType(req.ExecutionType.GetName())
	if err != nil {
		return nil, err
	}

	return &api.CreateExecutionTypeResponse{ExecutionType: eType}, nil
}

// GetExecutionType return the specified execution type.
func (s *Service) GetExecutionType(ctx context.Context, req *api.GetExecutionTypeRequest) (*api.GetExecutionTypeResponse, error) {
	eType, err := s.getExecutionType(req.GetName())
	if err != nil {
		return nil, err
	}

	return &api.GetExecutionTypeResponse{
		ExecutionType: eType,
	}, nil
}

// ListExecutionTypes lists all execution types.
func (s *Service) ListExecutionTypes(ctx context.Context, req *api.ListExecutionTypesRequest) (*api.ListExecutionTypesResponse, error) {
	// Assume at most 1K types (ugh!).
	var typeIDs []mlmetadata.ExecutionTypeID
	for i := 0; i < 1000; i++ {
		typeIDs = append(typeIDs, mlmetadata.ExecutionTypeID(i))
	}

	eTypes, err := s.store.GetExecutionTypesByID(typeIDs)
	if err != nil {
		return nil, err
	}

	res := &api.ListExecutionTypesResponse{}
	for _, eType := range eTypes {
		res.ExecutionTypes = append(res.ExecutionTypes, eType)
	}

	return res, nil
}

// DeleteExecutionType deletes the specified execution.
func (s *Service) DeleteExecutionType(ctx context.Context, req *api.DeleteExecutionTypeRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteExecutionType")
}

func (s *Service) getExecution(name string) (*mlpb.Execution, error) {
	tokens := executionNameRE.FindStringSubmatch(name)
	if len(tokens) != 2 {
		return nil, fmt.Errorf("malformed Execution name %q. Must match pattern %q", name, executionNameRE)
	}

	id, err := strconv.ParseInt(tokens[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Execution id from %q: %v", tokens[1], err)
	}

	executions, err := s.store.GetExecutionsByID([]mlmetadata.ExecutionID{mlmetadata.ExecutionID(id)})
	if err != nil {
		return nil, err
	}

	if len(executions) != 1 {
		return nil, fmt.Errorf("internal error: expecting single Execution, got instead : %v", executions)
	}

	return executions[0], nil
}

// CreateExecution creates the specified execution.
func (s *Service) CreateExecution(ctx context.Context, req *api.CreateExecutionRequest) (*api.CreateExecutionResponse, error) {
	if req.Execution == nil {
		return nil, errors.New("unspecified Execution")
	}

	if req.Execution.Id != nil {
		return nil, errors.New("id should remain unspecified when creating Execution")
	}

	eType, err := s.getExecutionType(req.Parent)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve ExecutionType under %q: %v", req.Parent, err)
	}

	req.Execution.TypeId = proto.Int64(eType.GetId())
	ids, err := s.store.PutExecutions([]*mlpb.Execution{req.Execution})
	if err != nil {
		return nil, err
	}

	if len(ids) != 1 {
		return nil, fmt.Errorf("internal error: expecting single new Execution id, got instead : %v", ids)
	}

	executionName := fmt.Sprintf("%s/executions/%d", req.Parent, ids[0])
	exec, err := s.getExecution(executionName)
	if err != nil {
		return nil, err
	}

	return &api.CreateExecutionResponse{Execution: exec}, nil

}

// GetExecution returns the specified execution.
func (s *Service) GetExecution(ctx context.Context, req *api.GetExecutionRequest) (*api.GetExecutionResponse, error) {
	exec, err := s.getExecution(req.GetName())
	if err != nil {
		return nil, err
	}

	return &api.GetExecutionResponse{Execution: exec}, nil
}

// ListExecutions returns all executions.
func (s *Service) ListExecutions(ctx context.Context, req *api.ListExecutionsRequest) (*api.ListExecutionsResponse, error) {
	var err error
	var executions []*mlpb.Execution
	if req.Name == "" {
		executions, err = s.store.GetExecutions()
	} else {
		typeName := strings.TrimPrefix(req.Name, executionTypesCollection)
		executions, err = s.store.GetExecutionsByType(typeName)
	}

	if err != nil {
		// An empty list is returned if no executions is found.
		if err.Error() != "Cannot find any record" {
			return nil, err
		}
		executions = []*mlpb.Execution{}
	}

	return &api.ListExecutionsResponse{Executions: executions}, nil
}

// DeleteExecution deletes the specified execution.
func (s *Service) DeleteExecution(ctx context.Context, req *api.DeleteExecutionRequest) (*empty.Empty, error) {
	return nil, errors.New("not implemented error: DeleteExecution")
}

func (s *Service) CreateEvent(ctx context.Context, req *api.CreateEventRequest) (*empty.Empty, error) {
	err := s.store.PutEvents([]*mlpb.Event{req.GetEvent()})
	return nil, err
}

func (s *Service) SearchEvents(ctx context.Context, req *api.SearchEventsRequest) (*api.SearchEventsResponse, error) {
	name := req.GetName()
	var events []*mlpb.Event
	var err error
	if strings.HasPrefix(name, artifactCollection) {
		id, err := strconv.ParseInt(strings.TrimPrefix(name, artifactCollection), 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse Artifact id from %q: %v", name, err)
		}
		events, err = s.store.GetEventsByArtifactIDs([]mlmetadata.ArtifactID{mlmetadata.ArtifactID(id)})
	} else {
		id, err := strconv.ParseInt(strings.TrimPrefix(name, executionCollection), 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse Artifact id from %q: %v", name, err)
		}
		events, err = s.store.GetEventsByExecutionIDs([]mlmetadata.ExecutionID{mlmetadata.ExecutionID(id)})
	}
	return &api.SearchEventsResponse{
		Events: events,
	}, err
}
