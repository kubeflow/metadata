package resource_logger

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

// Logger listens events related to resource changes by implementing the toolscache.ResourceEventHandler interfacae to log
// metadata into Kubeflow metadata service.
type Logger struct {
	kfmdClient      *kfmd.APIClient
	kfmdClientMutex *sync.Mutex
	resource        schema.GroupVersionKind
	workqueue       workqueue.RateLimitingInterface
}

// New creates a resouce logger for given resource GroupVersionKind and creates
// corresponding metadata artifact logging type for future logging.
func New(kfmdClient *kfmd.APIClient, kfmdClientMutex *sync.Mutex, gvk schema.GroupVersionKind) (*Logger, error) {
	l := &Logger{
		kfmdClient:      kfmdClient,
		kfmdClientMutex: kfmdClientMutex,
		resource:        gvk,
		workqueue:       workqueue.NewNamedRateLimitingQueue(workqueue.DefaultControllerRateLimiter(), gvk.String()),
	}
	resourceArtifactType := kfmd.MlMetadataArtifactType{
		Name: l.MetadataArtifactType(),
		Properties: map[string]kfmd.MlMetadataPropertyType{
			"name":   kfmd.STRING,
			"uid":    kfmd.STRING,
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

// MetadataArtifactType returns the metadata artifact type for the logger's GroupVerionKind
func (l *Logger) MetadataArtifactType() string {
	return fmt.Sprintf("kubeflow.org/%s/%s", l.resource.GroupKind(), l.resource.Version)
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
func (l *Logger) OnAdd(obj interface{}) {
	l.workqueue.AddRateLimited(event{
		kind:   addEvent,
		newVal: obj,
	})
}

// OnUpdate handles Kubernetes resouce instance update event.
func (l *Logger) OnUpdate(oldObj, newObj interface{}) {
	l.workqueue.AddRateLimited(event{
		kind:   updateEvent,
		oldVal: oldObj,
		newVal: newObj,
	})
}

// OnDelete handles Kubernetes resouce instance delete event.
func (l *Logger) OnDelete(obj interface{}) {
	l.workqueue.AddRateLimited(event{
		kind:   deleteEvent,
		newVal: obj,
	})
}

// Run starts worker thread after hasSynced returns true.
func (l *Logger) Run(stopCh <-chan struct{}, hasSynced func() bool) error {
	defer utilruntime.HandleCrash()
	defer l.workqueue.ShutDown()

	if ok := hasSynced(); !ok {
		return fmt.Errorf("failed to wait for caches to sync")
	}

	klog.Infof("Starting workers for %s\n", l.resource)
	go wait.Until(l.processNextWorkItem, 50*time.Millisecond, stopCh)
	klog.Infof("Started workers for %s\n", l.resource)
	<-stopCh
	klog.Infof("Shutting down workers for \n", l.resource)
	return nil
}

func (l *Logger) processNextWorkItem() {
	obj, shutdown := l.workqueue.Get()

	if shutdown {
		return
	}

	// We wrap this block in a func so we can defer c.workqueue.Done.
	err := func(obj interface{}) error {
		defer l.workqueue.Done(obj)
		var e event
		var ok bool
		if e, ok = obj.(event); !ok {
			// As the item in the workqueue is actually invalid, we call
			// Forget here else we'd go into a loop of attempting to
			// process a work item that is invalid.
			l.workqueue.Forget(obj)
			utilruntime.HandleError(fmt.Errorf("expected string in workqueue but got %#v", obj))
			return nil
		}
		l.handleEvent(e)
		// Finally, if no error occurs we Forget this item so it does not
		// get queued again until another change happens.
		l.workqueue.Forget(obj)
		return nil
	}(obj)

	if err != nil {
		utilruntime.HandleError(err)
	}
}

func (l *Logger) handleEvent(e event) error {
	var err error
	switch e.kind {
	case addEvent:
		err = l.handleAddEvent(e)
	case updateEvent:
		err = l.handleUpdateEvent(e)
	case deleteEvent:
		err = l.handleDeleteEvent(e)
	default:
		err = fmt.Errorf("unknow event: %v", e)
	}
	return err
}

func (l *Logger) handleAddEvent(e event) error {
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
	exists, err := l.ifExists(object.GetUID())
	if err != nil {
		klog.Errorf("failed to check if object of type %s exisits: %s", l.MetadataArtifactType(), err)
		return err
	}
	if exists {
		klog.Infof("Hanlded OnAdd for %s. Object already exists with UID = %s, name = %s.\n", l.MetadataArtifactType(), object.GetUID(), object.GetName())
		return nil
	}
	b, err := json.Marshal(e.newVal)
	if err != nil {
		klog.Errorf("failed to convert %s object to bytes: %s", l.MetadataArtifactType(), err)
		return err
	}
	l.kfmdClientMutex.Lock()
	_, _, err = l.kfmdClient.MetadataServiceApi.CreateArtifact(
		context.Background(),
		l.MetadataArtifactType(),
		kfmd.MlMetadataArtifact{
			Properties: map[string]kfmd.MlMetadataValue{
				"uid":    kfmd.MlMetadataValue{StringValue: string(object.GetUID())},
				"name":   kfmd.MlMetadataValue{StringValue: string(object.GetName())},
				"object": kfmd.MlMetadataValue{StringValue: string(b)},
			},
		},
	)
	l.kfmdClientMutex.Unlock()
	if err != nil {
		klog.Errorf("failed to log metadata for %s: %s", l.MetadataArtifactType(), err)
		return err
	}
	klog.Infof("Hanlded OnAdd for %s.\n", l.MetadataArtifactType())
	return nil
}

func (l *Logger) handleUpdateEvent(e event) error {
	return nil
}

func (l *Logger) handleDeleteEvent(e event) error {
	return nil
}

func (l *Logger) ifExists(uid types.UID) (bool, error) {
	l.kfmdClientMutex.Lock()
	resp, _, err := l.kfmdClient.MetadataServiceApi.ListArtifacts(context.Background(), l.MetadataArtifactType())
	l.kfmdClientMutex.Unlock()
	if err != nil {
		return false, fmt.Errorf("failed to get list of artifacts for %s: error = %s, response = %v", l.MetadataArtifactType(), err, resp)
	}
	for _, artifact := range resp.Artifacts {
		if artifact.Properties["uid"].StringValue == string(uid) {
			return true, nil
		}
	}
	return false, nil
}
