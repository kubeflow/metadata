package watcher

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
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/util/workqueue"
	"k8s.io/klog"
)

// Watcher listens events related to a resource by implementing the toolscache.ResourceEventHandler interfacae to log
// metadata into Kubeflow metadata service.
// TODO(zhenghuiwang): Allow toolscache.ResourceEventHandler to be passed in so that other types of watchers don't have to reimplement event queue.
type Watcher struct {
	kfmdClient *kfmd.APIClient
	// Mutex is shared among all watchers to sync the outbound requests to the Metadata service, becaue concurrent requests to a server cause crash.
	kfmdClientMutex *sync.Mutex
	// GroupVerionKind of the resource being watched.
	resource schema.GroupVersionKind
	// workqueue for handling events at our own pace instead of when they are happenning.
	// It also guarantees we process one event at a time.
	workqueue workqueue.RateLimitingInterface
}

// New creates a resouce Watcher for given resource GroupVersionKind and creates
// corresponding metadata artifact logging type for future logging.
func New(kfmdClient *kfmd.APIClient, kfmdClientMutex *sync.Mutex, gvk schema.GroupVersionKind) (*Watcher, error) {
	w := &Watcher{
		kfmdClient:      kfmdClient,
		kfmdClientMutex: kfmdClientMutex,
		resource:        gvk,
		workqueue:       workqueue.NewNamedRateLimitingQueue(workqueue.DefaultControllerRateLimiter(), gvk.String()),
	}
	resourceArtifactType := kfmd.MlMetadataArtifactType{
		Name: w.MetadataArtifactType(),
		Properties: map[string]kfmd.MlMetadataPropertyType{
			"name":   kfmd.STRING,
			"uid":    kfmd.STRING,
			"object": kfmd.STRING,
		},
	}
	w.kfmdClientMutex.Lock()
	resp, httpResp, err := kfmdClient.MetadataServiceApi.CreateArtifactType(context.Background(), resourceArtifactType)
	w.kfmdClientMutex.Unlock()
	if err != nil {
		return nil, fmt.Errorf("failed to create artifact type: err %v response %v, http response %v", err, resp, httpResp)
	}
	return w, nil
}

// MetadataArtifactType returns the metadata artifact type for the watcher's GroupVerionKind
func (w *Watcher) MetadataArtifactType() string {
	return fmt.Sprintf("kubeflow.org/%s/%s", w.resource.GroupKind(), w.resource.Version)
}

type eventType int

const (
	unknown     eventType = 0
	addEvent    eventType = 1
	updateEvent eventType = 2
	deleteEvent eventType = 3
)

type event struct {
	kind   eventType
	oldVal interface{}
	newVal interface{}
}

// OnAdd handles Kubernetes resouce instance creates event.
func (w *Watcher) OnAdd(obj interface{}) {
	w.workqueue.AddRateLimited(event{
		kind:   addEvent,
		newVal: obj,
	})
}

// OnUpdate handles Kubernetes resouce instance update event.
func (w *Watcher) OnUpdate(oldObj, newObj interface{}) {
	w.workqueue.AddRateLimited(event{
		kind:   updateEvent,
		oldVal: oldObj,
		newVal: newObj,
	})
}

// OnDelete handles Kubernetes resouce instance delete event.
func (w *Watcher) OnDelete(obj interface{}) {
	w.workqueue.AddRateLimited(event{
		kind:   deleteEvent,
		newVal: obj,
	})
}

// Run starts worker thread after hasSynced returns true.
func (w *Watcher) Run(stopCh <-chan struct{}, hasSynced func() bool) error {
	defer utilruntime.HandleCrash()
	defer w.workqueue.ShutDown()

	if ok := hasSynced(); !ok {
		return fmt.Errorf("failed to wait for caches to sync")
	}

	klog.Infof("Starting workers for %s\n", w.resource)
	go wait.Until(w.processNextWorkItem, 50*time.Millisecond, stopCh)
	klog.Infof("Started workers for %s\n", w.resource)
	<-stopCh
	klog.Infof("Shutting down workers for \n", w.resource)
	return nil
}

func (w *Watcher) processNextWorkItem() {
	obj, shutdown := w.workqueue.Get()

	if shutdown {
		return
	}

	// We wrap this block in a func so we can defer c.workqueue.Done.
	err := func(obj interface{}) error {
		defer w.workqueue.Done(obj)
		var e event
		var ok bool
		if e, ok = obj.(event); !ok {
			// As the item in the workqueue is actually invalid, we call
			// Forget here else we'd go into a loop of attempting to
			// process a work item that is invalid.
			w.workqueue.Forget(obj)
			utilruntime.HandleError(fmt.Errorf("expected string in workqueue but got %#v", obj))
			return nil
		}
		w.handleEvent(e)
		// Finally, if no error occurs we Forget this item so it does not
		// get queued again until another change happens.
		w.workqueue.Forget(obj)
		return nil
	}(obj)

	if err != nil {
		utilruntime.HandleError(err)
	}
}

func (w *Watcher) handleEvent(e event) error {
	var err error
	switch e.kind {
	case addEvent:
		err = w.handleAddEvent(e)
	case updateEvent:
		err = w.handleUpdateEvent(e)
	case deleteEvent:
		err = w.handleDeleteEvent(e)
	default:
		err = fmt.Errorf("unknow event: %v", e)
	}
	return err
}

func (w *Watcher) handleAddEvent(e event) error {
	var object metav1.Object
	var ok bool
	obj := e.newVal
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
	exists, err := w.ifExists(object.GetUID())
	if err != nil {
		klog.Errorf("failed to check if object of type %s exisits: %s", w.MetadataArtifactType(), err)
		return err
	}
	if exists {
		klog.Infof("Hanlded addEvent for %s. Object already exists with UID = %s, name = %s.\n", w.MetadataArtifactType(), object.GetUID(), object.GetName())
		return nil
	}
	b, err := json.Marshal(e.newVal)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", w.MetadataArtifactType(), err)
		return err
	}
	w.kfmdClientMutex.Lock()
	_, _, err = w.kfmdClient.MetadataServiceApi.CreateArtifact(
		context.Background(),
		w.MetadataArtifactType(),
		kfmd.MlMetadataArtifact{
			Properties: map[string]kfmd.MlMetadataValue{
				"uid":    kfmd.MlMetadataValue{StringValue: string(object.GetUID())},
				"name":   kfmd.MlMetadataValue{StringValue: string(object.GetName())},
				"object": kfmd.MlMetadataValue{StringValue: string(b)},
			},
		},
	)
	w.kfmdClientMutex.Unlock()
	if err != nil {
		klog.Errorf("failed to log metadata for %s: %s", w.MetadataArtifactType(), err)
		return err
	}
	klog.Infof("Hanlded addEvent for %s.\n", w.MetadataArtifactType())
	return nil
}

func (w *Watcher) handleUpdateEvent(e event) error {
	return nil
}

func (w *Watcher) handleDeleteEvent(e event) error {
	return nil
}

func (w *Watcher) ifExists(uid types.UID) (bool, error) {
	w.kfmdClientMutex.Lock()
	resp, _, err := w.kfmdClient.MetadataServiceApi.ListArtifacts(context.Background(), w.MetadataArtifactType())
	w.kfmdClientMutex.Unlock()
	if err != nil {
		return false, fmt.Errorf("failed to get list of artifacts for %s: error = %s, response = %v", w.MetadataArtifactType(), err, resp)
	}
	for _, artifact := range resp.Artifacts {
		if artifact.Properties["uid"].StringValue == string(uid) {
			return true, nil
		}
	}
	return false, nil
}
