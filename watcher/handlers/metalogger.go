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

// Package handlers contains handlers that implements Kubernetes toolscache.ResourceEventHandler.
// The hankders are expected to be used with watchers and handle events dispatched by watchers.
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	mlpb "ml_metadata/proto/metadata_store_go_proto"
	storepb "ml_metadata/proto/metadata_store_service_go_proto"

	"github.com/golang/protobuf/proto"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/tools/cache"
	"k8s.io/klog"
)

const workspace = "resource_watcher"

// MetaLogger logs newly created k8s resources into metadata service.
type MetaLogger struct {
	// Metadata gRPC client.
	kfmdClient storepb.MetadataStoreServiceClient
	// GroupVerionKind of the resource being watched.
	resource schema.GroupVersionKind
	typeID   int64
}

// NewMetaLogger creates a new MetaLogger for a specific k8s GroupVersionKind.
func NewMetaLogger(kfmdClient storepb.MetadataStoreServiceClient, gvk schema.GroupVersionKind) (*MetaLogger, error) {
	l := &MetaLogger{
		resource:   gvk,
		kfmdClient: kfmdClient,
	}
	resourceArtifactType := mlpb.ArtifactType{
		Name: proto.String(l.MetadataArtifactType()),
		Properties: map[string]mlpb.PropertyType{
			// same as metav1.Object.Name
			"name": mlpb.PropertyType_STRING,
			// same as metav1.Object.UID
			"version": mlpb.PropertyType_STRING,
			// same as metav1.Object.Time in rfc3339 format
			"create_time": mlpb.PropertyType_STRING,
			// stores the metav1.Object
			"object": mlpb.PropertyType_STRING,
		},
	}
	request := storepb.PutArtifactTypeRequest{
		ArtifactType:   &resourceArtifactType,
		AllFieldsMatch: proto.Bool(true),
	}
	resp, err := kfmdClient.PutArtifactType(context.Background(), &request)
	if err != nil {
		return l, fmt.Errorf("failed to create artifact type: err = %v; request = %v; response = %v", err, request, resp)
	}
	l.typeID = resp.GetTypeId()
	return l, nil
}

// MetadataArtifactType returns the metadata artifact type for the MetaLogger's GroupVerionKind
func (l *MetaLogger) MetadataArtifactType() string {
	return fmt.Sprintf("kubeflow.org/%s/%s", l.resource.GroupKind(), l.resource.Version)
}

// OnAdd handles Kubernetes resouce instance creates event.
func (l *MetaLogger) OnAdd(obj interface{}) error {
	var object metav1.Object
	var ok bool
	if object, ok = obj.(metav1.Object); !ok {
		tombstone, ok := obj.(cache.DeletedFinalStateUnknown)
		if !ok {
			return fmt.Errorf("error decoding object, invalid type")
		}
		object, ok = tombstone.Obj.(metav1.Object)
		if !ok {
			return fmt.Errorf("error decoding object tombstone, invalid type")
		}
	}
	exists, err := l.ifExists(object.GetUID())
	if err != nil {
		klog.Errorf("failed to check if object of type %s exisits: %s", l.MetadataArtifactType(), err)
		return err
	}
	if exists {
		klog.Infof("Handled addEvent for %s. Object already exists with UID = %s, name = %s.\n", l.MetadataArtifactType(), object.GetUID(), object.GetName())
		return nil
	}
	b, err := json.Marshal(obj)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", l.MetadataArtifactType(), err)
		return err
	}
	artifact := mlpb.Artifact{
		TypeId: proto.Int64(l.typeID),
		Uri:    proto.String(object.GetSelfLink()),
		Properties: map[string]*mlpb.Value{
			"name":        mlpbStringValue(object.GetName()),
			"version":     mlpbStringValue(string(object.GetUID())),
			"create_time": mlpbStringValue(object.GetCreationTimestamp().Format(time.RFC3339)),
			"object":      mlpbStringValue(string(b)),
		},
		CustomProperties: map[string]*mlpb.Value{
			// set the workspace to group the metadata.
			"__kf_workspace__": mlpbStringValue(workspace),
		},
	}
	request := storepb.PutArtifactsRequest{
		Artifacts: []*mlpb.Artifact{&artifact},
	}
	resp, err := l.kfmdClient.PutArtifacts(context.Background(), &request)
	if err != nil {
		klog.Errorf("failed to log metadata for %s: err = %s, request = %v, resp = %v", l.MetadataArtifactType(), err, request, resp)
		return err
	}
	klog.Infof("Handled addEvent for %s.\n", l.MetadataArtifactType())
	return nil
}

func mlpbStringValue(s string) *mlpb.Value {
	return &mlpb.Value{
		Value: &mlpb.Value_StringValue{
			StringValue: s,
		},
	}
}

// OnUpdate handles Kubernetes resouce instance update event.
func (l *MetaLogger) OnUpdate(oldObj, newObj interface{}) error {
	return nil
}

// OnDelete handles Kubernetes resouce instance delete event.
func (l *MetaLogger) OnDelete(obj interface{}) error {
	return nil
}

func (l *MetaLogger) ifExists(uid types.UID) (bool, error) {
	request := storepb.GetArtifactsByTypeRequest{
		TypeName: proto.String(l.MetadataArtifactType()),
	}
	resp, err := l.kfmdClient.GetArtifactsByType(context.Background(), &request)
	if err != nil {
		return false, fmt.Errorf("failed to get list of artifacts for %s: err = %s, request = %v, response = %v", l.MetadataArtifactType(), err, request, resp)
	}
	for _, artifact := range resp.Artifacts {
		if artifact.Properties["version"].GetStringValue() == string(uid) {
			return true, nil
		}
	}
	return false, nil
}
