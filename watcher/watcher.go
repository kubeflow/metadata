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

package watcher

import (
	"fmt"
	"time"

	"k8s.io/apimachinery/pkg/runtime/schema"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/util/workqueue"
	"k8s.io/klog"
)

// Watcher listens events related to a resource by implementing the toolscache.ResourceEventHandler interfacae to log
// metadata into Kubeflow metadata service.
type Watcher struct {
	// GroupVerionKind of the resource being watched.
	resource schema.GroupVersionKind
	// workqueue for handling events at our own pace instead of when they are happenning.
	// It also guarantees we process one event at a time.
	workqueue workqueue.RateLimitingInterface
	handler   Handler
}

// Handler can handle notifications for events that happen to a resource.
// If an error is returned, the event will be put back to the queue for
// future reprocessing.
//  * OnAdd is called when an object is added.
//  * OnUpdate is called when an object is modified. Note that oldObj is the
//      last known state of the object-- it is possible that several changes
//      were combined together, so you can't use this to see every single
//      change. OnUpdate is also called when a re-list happens, and it will
//      get called even if nothing changed. This is useful for periodically
//      evaluating or syncing something.
//  * OnDelete will get the final state of the item if it is known, otherwise
//      it will get an object of type DeletedFinalStateUnknown. This can
//      happen if the watch is closed and misses the delete event and we don't
//      notice the deletion until the subsequent re-list.
type Handler interface {
	OnAdd(obj interface{}) error
	OnUpdate(oldObj, newObj interface{}) error
	OnDelete(obj interface{}) error
}

// New creates a resouce Watcher for given resource GroupVersionKind and creates
// corresponding metadata artifact logging type for future logging.
func New(gvk schema.GroupVersionKind, handler Handler) *Watcher {
	return &Watcher{
		resource:  gvk,
		handler:   handler,
		workqueue: workqueue.NewNamedRateLimitingQueue(workqueue.DefaultControllerRateLimiter(), gvk.String()),
	}
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

	defer w.workqueue.Done(obj)
	var e event
	var ok bool
	if e, ok = obj.(event); !ok {
		// As the item in the workqueue is actually invalid, we call
		// Forget here else we'd go into a loop of attempting to
		// process a work item that is invalid.
		w.workqueue.Forget(obj)
		utilruntime.HandleError(fmt.Errorf("expected event in workqueue but got %#v", obj))
		return
	}

	if err := w.handleEvent(e); err != nil {
		utilruntime.HandleError(fmt.Errorf("error processing object: err = %v, obj = %#v", err, obj))
		// Add the obj back to the queue for future processing.
		w.workqueue.AddRateLimited(obj)
	}
}

func (w *Watcher) handleEvent(e event) error {
	var err error
	switch e.kind {
	case addEvent:
		err = w.handler.OnAdd(e.newVal)
	case updateEvent:
		err = w.handler.OnUpdate(e.oldVal, e.newVal)
	case deleteEvent:
		err = w.handler.OnDelete(e.newVal)
	default:
		klog.Errorf("unknown event: %v", e)
	}
	return err
}
