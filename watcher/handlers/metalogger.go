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
	"sync"
	"time"

	kfmd "github.com/kubeflow/metadata/sdk/go/openapi_client"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/tools/cache"
	"k8s.io/klog"
)

const workspace = "resource_watcher"

// MetaLogger logs k8s resource when being created.
type MetaLogger struct {
	kfmdClient *kfmd.APIClient
	// Mutex is shared among all watchers to sync the outbound requests to the Metadata service, becaue concurrent requests to a server cause crash.
	// https://github.com/kubeflow/metadata/issues/128
	kfmdClientMutex *sync.Mutex
	// GroupVerionKind of the resource being watched.
	resource schema.GroupVersionKind
}

// NewMetaLogger creates a new MetaLogger for a specific k8s GroupVersionKind.
func NewMetaLogger(kfmdClient *kfmd.APIClient, kfmdClientMutex *sync.Mutex, gvk schema.GroupVersionKind) (*MetaLogger, error) {
	l := &MetaLogger{
		resource:        gvk,
		kfmdClient:      kfmdClient,
		kfmdClientMutex: kfmdClientMutex,
	}
	resourceArtifactType := kfmd.MlMetadataArtifactType{
		Name: l.MetadataArtifactType(),
		Properties: map[string]kfmd.MlMetadataPropertyType{
			// same as metav1.Object.Name
			"name": kfmd.STRING,
			// same as metav1.Object.UID
			"version": kfmd.STRING,
			// same as metav1.Object.Time in rfc3339 format
			"create_time": kfmd.STRING,
			// stores the metav1.Object
			"object": kfmd.STRING,
		},
	}
	l.kfmdClientMutex.Lock()
	resp, httpResp, err := kfmdClient.MetadataServiceApi.CreateArtifactType(context.Background(), resourceArtifactType)
	l.kfmdClientMutex.Unlock()
	if err != nil {
		return nil, fmt.Errorf("failed to create artifact type: err %v response %v, http response %v", err, resp, httpResp)
	}
	return l, nil
}

// MetadataArtifactType returns the metadata artifact type for the watcher's GroupVerionKind
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
		klog.Infof("Hanlded addEvent for %s. Object already exists with UID = %s, name = %s.\n", l.MetadataArtifactType(), object.GetUID(), object.GetName())
		return nil
	}
	b, err := json.Marshal(obj)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", l.MetadataArtifactType(), err)
		return err
	}
	l.kfmdClientMutex.Lock()
	_, _, err = l.kfmdClient.MetadataServiceApi.CreateArtifact(
		context.Background(),
		l.MetadataArtifactType(),
		kfmd.MlMetadataArtifact{
			Uri: object.GetSelfLink(),
			Properties: map[string]kfmd.MlMetadataValue{
				"name":        kfmd.MlMetadataValue{StringValue: object.GetName()},
				"version":     kfmd.MlMetadataValue{StringValue: string(object.GetUID())},
				"create_time": kfmd.MlMetadataValue{StringValue: object.GetCreationTimestamp().Format(time.RFC3339)},
				"object":      kfmd.MlMetadataValue{StringValue: string(b)},
			},
			CustomProperties: map[string]kfmd.MlMetadataValue{
				// set the workspace to group the metadata.
				"__kf_workspace__": kfmd.MlMetadataValue{StringValue: workspace},
			},
		},
	)
	l.kfmdClientMutex.Unlock()
	if err != nil {
		klog.Errorf("failed to log metadata for %s: %s", l.MetadataArtifactType(), err)
		return err
	}
	klog.Infof("Hanlded addEvent for %s.\n", l.MetadataArtifactType())
	return nil
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
	l.kfmdClientMutex.Lock()
	resp, _, err := l.kfmdClient.MetadataServiceApi.ListArtifacts(context.Background(), l.MetadataArtifactType())
	l.kfmdClientMutex.Unlock()
	if err != nil {
		return false, fmt.Errorf("failed to get list of artifacts for %s: error = %s, response = %v", l.MetadataArtifactType(), err, resp)
	}
	for _, artifact := range resp.Artifacts {
		if artifact.Properties["version"].StringValue == string(uid) {
			return true, nil
		}
	}
	return false, nil
}
