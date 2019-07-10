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
	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
)

// MetadataStore defines the interface of methods exported by mlmetadata.Store.
type MetadataStore interface {
	Close()

	PutArtifactType(atype *mlpb.ArtifactType, opts *mlmetadata.PutTypeOptions) (mlmetadata.ArtifactTypeID, error)
	GetArtifactType(name string) (*mlpb.ArtifactType, error)
	GetArtifactTypesByID(tids []mlmetadata.ArtifactTypeID) ([]*mlpb.ArtifactType, error)
	GetArtifactTypes() ([]*mlpb.ArtifactType, error)

	PutArtifacts(artifacts []*mlpb.Artifact) ([]mlmetadata.ArtifactID, error)
	GetArtifactsByID(aids []mlmetadata.ArtifactID) ([]*mlpb.Artifact, error)
	GetArtifacts() ([]*mlpb.Artifact, error)
	GetArtifactsByType(typeName string) ([]*mlpb.Artifact, error)
	GetArtifactsByURI(uri string) ([]*mlpb.Artifact, error)

	PutExecutionType(etype *mlpb.ExecutionType, opts *mlmetadata.PutTypeOptions) (mlmetadata.ExecutionTypeID, error)
	GetExecutionType(typeName string) (*mlpb.ExecutionType, error)
	GetExecutionTypesByID(tids []mlmetadata.ExecutionTypeID) ([]*mlpb.ExecutionType, error)
	GetExecutionTypes() ([]*mlpb.ExecutionType, error)

	PutExecutions(executions []*mlpb.Execution) ([]mlmetadata.ExecutionID, error)
	GetExecutionsByID(eids []mlmetadata.ExecutionID) ([]*mlpb.Execution, error)
	GetExecutions() ([]*mlpb.Execution, error)
	GetExecutionsByType(typeName string) ([]*mlpb.Execution, error)

	PutEvents(events []*mlpb.Event) error
	GetEventsByArtifactIDs([]mlmetadata.ArtifactID) ([]*mlpb.Event, error)
	GetEventsByExecutionIDs([]mlmetadata.ExecutionID) ([]*mlpb.Event, error)
}
