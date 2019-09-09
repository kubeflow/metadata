package resource_logger

import (
	"context"
	"encoding/json"
	"fmt"

	kfmd "github.com/kubeflow/metadata/sdk/go/openapi_client"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/klog"
)

// Logger listens events related to resource changes by implementing the toolscache.ResourceEventHandler interfacae to log
// metadata into Kubeflow metadata service.
type Logger struct {
	kfmdClient *kfmd.APIClient
	resource   schema.GroupVersionKind
}

// New creates a resouce logger for given resource GroupVersionKind and creates
// corresponding metadata artifact logging type for future logging.
func New(kfmdClient *kfmd.APIClient, gvk schema.GroupVersionKind) (*Logger, error) {
	l := &Logger{
		kfmdClient: kfmdClient,
		resource:   gvk,
	}
	resourceArtifactType := kfmd.MlMetadataArtifactType{
		Name: l.MetadataArtifactType(),
		Properties: map[string]kfmd.MlMetadataPropertyType{
			"object": kfmd.STRING,
		},
	}
	_, _, err := kfmdClient.MetadataServiceApi.CreateArtifactType(context.Background(), resourceArtifactType)
	return l, err
}

// MetadataArtifactType returns the metadata artifact type for the logger's GroupVerionKind
func (l *Logger) MetadataArtifactType() string {
	return fmt.Sprintf("kubeflow.org/%s.%s/%s", l.resource.Group, l.resource.Kind, l.resource.Version)
}

// OnAdd handles Kubernetes resouce instance creates event.
func (l *Logger) OnAdd(obj interface{}) {
	b, err := json.Marshal(obj)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", l.MetadataArtifactType(), err)
		return
	}
	_, _, err = l.kfmdClient.MetadataServiceApi.CreateArtifact(
		context.Background(),
		l.MetadataArtifactType(),
		kfmd.MlMetadataArtifact{
			Properties: map[string]kfmd.MlMetadataValue{
				"object": kfmd.MlMetadataValue{StringValue: string(b)},
			},
		},
	)
	if err != nil {
		klog.Errorf("failed to log metadata for %s: %s", l.MetadataArtifactType(), err)
		return
	}
	klog.Infof("Hanlded OnAdd for %s.\n", l.MetadataArtifactType())
}

// OnUpdate handles Kubernetes resouce instance update event.
func (l *Logger) OnUpdate(oldObj, newObj interface{}) {
}

// OnDelete handles Kubernetes resouce instance delete event.
func (l *Logger) OnDelete(obj interface{}) {
}
