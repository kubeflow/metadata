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
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/kubeflow/metadata/watcher/api/v1alpha1"
	"github.com/kubeflow/metadata/watcher/pkg/k8smlmd"
	"go.uber.org/zap"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"time"

	mlpb "ml_metadata/proto/metadata_store_go_proto"
	storepb "ml_metadata/proto/metadata_store_service_go_proto"

	"github.com/golang/protobuf/proto"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	k8syaml "k8s.io/apimachinery/pkg/util/yaml"
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

	// gvks is a map from GVK to MLMD type ids.
	gvkIds map[schema.GroupVersionKind]int64

	log logr.Logger
}

// NewMetaLogger creates a new MetaLogger for a specific k8s GroupVersionKind.
func NewMetaLogger(kfmdClient storepb.MetadataStoreServiceClient, gvk schema.GroupVersionKind) (*MetaLogger, error) {
	l := &MetaLogger{
		resource:   gvk,
		kfmdClient: kfmdClient,
		log: zapr.NewLogger(zap.L()),
		gvkIds: map[schema.GroupVersionKind]int64{},
	}
	
	// TODO(jlewi): Should we be defining these types using jsonschema and then using SchemaParser to load them up?
	executionArtifactType := &mlpb.ExecutionType{
		Name:                 proto.String(k8smlmd.GVKToType(l.resource)),
		Properties:           map[string]mlpb.PropertyType{
			// same as metav1.Object.Name
			"name": mlpb.PropertyType_STRING,
			// same as metav1.Object.UID
			"version": mlpb.PropertyType_STRING,
			// same as metav1.Object.Time in rfc3339 format
			"create_time": mlpb.PropertyType_STRING,
			// stores the metav1.Object
			"object": mlpb.PropertyType_STRING,
		},
		// TODO(jlewi): Are Input/OutputType required.
		// InputType:            nil,
		// OutputType:           nil,
	}

	request := storepb.PutExecutionTypeRequest{
		ExecutionType:   executionArtifactType,
		AllFieldsMatch: proto.Bool(true),
	}

	resp, err := kfmdClient.PutExecutionType(context.Background(), &request)
	if err != nil {
		return l, fmt.Errorf("failed to create execution type: err = %v; request = %v; response = %v", err, request, resp)
	}
	l.typeID = resp.GetTypeId()

	return l, nil
}

// OnAdd handles Kubernetes resource instance creates event.
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
	log := l.log.WithValues("name", object.GetName(), "uid", object.GetUID())

	exists, err := l.ifExists(object.GetUID())

	executionType := k8smlmd.GVKToType(l.resource)
	if err != nil {
		klog.Errorf("failed to check if object of type %s exisits: %s", executionType, err)
		return err
	}
	if exists {
		klog.Infof("Handled addEvent for %s. Object already exists with UID = %s, name = %s.\n", executionType, object.GetUID(), object.GetName())
		return nil
	}
	b, err := json.Marshal(obj)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", executionType, err)
		return err
	}
	execution := &mlpb.Execution{
		TypeId: proto.Int64(l.typeID),
		Properties: map[string]*mlpb.Value{
			"name":        mlpbStringValue(object.GetName()),
			// TODO(jlewi): Why are we calling this property "version" as opposed to something like UID?
			"version":     mlpbStringValue(string(object.GetUID())),
			"create_time": mlpbStringValue(object.GetCreationTimestamp().Format(time.RFC3339)),
			"object":      mlpbStringValue(string(b)),
		},
		CustomProperties: map[string]*mlpb.Value{
			// set the workspace to group the metadata.
			"__kf_workspace__": mlpbStringValue(workspace),
		},
	}
	request := storepb.PutExecutionsRequest{
		Executions: []*mlpb.Execution{execution},
	}
	resp, err := l.kfmdClient.PutExecutions(context.Background(), &request)
	if err != nil {
		klog.Errorf("failed to log metadata for %s: err = %s, request = %v, resp = %v", k8smlmd.GVKToType(l.resource), err, request, resp)
		return err
	}

	if len(resp.ExecutionIds) == 0 {
		err := fmt.Errorf("No execution id returned from MLMD")
		log.Error(err, "Newly created execution is missing an id")
		return err
	}

	for  _, annotation := range []string{v1alpha1.InputAnnotation, v1alpha1.OutputAnnotation} {
		ids, err := l.logArtifactAnnotation(object, annotation)

		if err != nil {
			log.Error(err, "Could not log artifact annotation", "annotation", annotation)
			continue
		}

		// Create events connecting the execution and artifacts
		for _, aId := range ids {
			// TODO(jlewi): What should we set for the path if anythong?
			e := &mlpb.Event{
				ArtifactId: proto.Int64(aId),
				ExecutionId: proto.Int64(resp.ExecutionIds[0]),
			}

			if annotation == v1alpha1.InputAnnotation {
				e.Type = mlpb.Event_INPUT.Enum()
			} else {
				e.Type = mlpb.Event_OUTPUT.Enum()
			}

			eRequest := &storepb.PutEventsRequest{
				Events:               []*mlpb.Event{e},
			}
			_, err := l.kfmdClient.PutEvents(context.Background(), eRequest)

			if err != nil {
				log.Error(err, "Failed to create event", "event", e)
			}
		}
	}

	log.Info("Handled addEvent")
	return nil
}

// logArtifactAnnotation looks for the specified annotation and if it is present tries to create an
// artifact storing that value.
func (l *MetaLogger) logArtifactAnnotation(object metav1.Object, annotation string) ([]int64, error) {
	log := l.log.WithValues("name", object.GetName(), "uid", object.GetUID())

	input, ok := object.GetAnnotations()[annotation]

	if !ok {
		return []int64{}, nil
	}

	inputArtifact, err := toUnstructured(input)

	if err != nil {
		return []int64{}, err
	}

	gvk := inputArtifact.GetObjectKind().GroupVersionKind()

	mlmdTypeId, ok := l.gvkIds[gvk]

	if !ok {
		// No type has been created yet so register the type.
		err = l.createArtifactType(gvk)

		if err != nil {
			log.Error(err, "Could not create artifact type for gvk", "gvk", gvk)
			return []int64{}, err
		}

		mlmdTypeId, ok = l.gvkIds[gvk]

		if !ok {
			err := fmt.Errorf("Could not find TypeId for newly created MLMD artifact")
			log.Error(err, "Could not find TypeId for newly created MLMD artifact")
			return []int64{},err
		}
	}

	ids, err := k8smlmd.CreateObjectArtifact(l.kfmdClient, mlmdTypeId, inputArtifact, workspace)

	return ids, err
}

// toUnstructured tries to decode the string as the YAML or JSon representation of an unstructured object
//
// TODO(jlewi): Create a unittest.
func toUnstructured(input string)(*unstructured.Unstructured, error) {
	u := &unstructured.Unstructured{}
	BUFSIZE := 1024
	buf := bytes.NewBufferString(input)
	err := k8syaml.NewYAMLOrJSONDecoder(buf, BUFSIZE).Decode(u)
	return u, err
}

// createArtifactType creates an artifact for the given GVK.
func (l *MetaLogger) createArtifactType(gvk schema.GroupVersionKind) error {
	// TODO(jlewi): Should we be defining these types using jsonschema and then using SchemaParser to load them up?
	mlmdType := &mlpb.ArtifactType{
		Name:                 proto.String(k8smlmd.GVKToType(gvk)),
		Properties:           map[string]mlpb.PropertyType{
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

	request := &storepb.PutArtifactTypeRequest{
		ArtifactType:   mlmdType,
		AllFieldsMatch: proto.Bool(true),
	}

	resp, err := l.kfmdClient.PutArtifactType(context.Background(), request)
	if err != nil {
		return fmt.Errorf("failed to create execution type: err = %v; request = %v; response = %v", err, request, resp)
	}
	l.gvkIds[gvk] = resp.GetTypeId()

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

// TODO(jlewi): Why are we listing all types of a given artifact rather than
// calling GetExecutionsByID
// https://github.com/google/ml-metadata/blob/1772ee39766c3c02dba4b3e3b43a8745b2eb58af/ml_metadata/proto/metadata_store_service.proto#L813
// is this because the id is assigned by the metadata server so we don't know what it is?
// Maybe we should add the metadata assigned id as an annotation to the object
// so we can get it on subsequent requests.
func (l *MetaLogger) ifExists(uid types.UID) (bool, error) {
	executionType := k8smlmd.GVKToType(l.resource)
	request := storepb.GetExecutionsByTypeRequest{
		TypeName: proto.String(executionType),
	}
	resp, err := l.kfmdClient.GetExecutionsByType(context.Background(), &request)
	if err != nil {
		return false, fmt.Errorf("failed to get list of artifacts for %s: err = %s, request = %v, response = %v", executionType, err, request, resp)
	}
	for _, e := range resp.Executions {
		if e.Properties["version"].GetStringValue() == string(uid) {
			return true, nil
		}
	}
	return false, nil
}
