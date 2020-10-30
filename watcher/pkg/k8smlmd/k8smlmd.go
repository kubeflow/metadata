// package k8smlmd provides a library for recording data about K8s resources to MLMD
package k8smlmd

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/golang/protobuf/proto"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	mlpb "ml_metadata/proto/metadata_store_go_proto"
	storepb "ml_metadata/proto/metadata_store_service_go_proto"
	"time"
)
// GVKToType returns the corresponding metadata artifact type for the GVK
func  GVKToType(gvk schema.GroupVersionKind) string {
	return fmt.Sprintf("kubeflow.org/%s/%s", gvk.GroupKind(), gvk.Version)
}

// CreateObjectArtifact creates an artifact representing the given object.
func CreateObjectArtifact(client storepb.MetadataStoreServiceClient, typeId int64, object metav1.Object, workspace string) ([]int64, error) {
	// TODO(jlewi): Should we use YAML instead of json? json is what the original code was using.
	b, err := json.Marshal(object)

	ids := []int64{}

	if err != nil {
		return ids, err
	}

	a := &mlpb.Artifact{
		TypeId: proto.Int64(typeId),
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
	request := &storepb.PutArtifactsRequest{
		Artifacts: []*mlpb.Artifact{a},
	}
	res, err := client.PutArtifacts(context.Background(), request)
	return res.GetArtifactIds(), err
}

func mlpbStringValue(s string) *mlpb.Value {
	return &mlpb.Value{
		Value: &mlpb.Value_StringValue{
			StringValue: s,
		},
	}
}