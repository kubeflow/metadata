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

package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"

	storepb "ml_metadata/proto/metadata_store_service_go_proto"

	"github.com/kubeflow/metadata/watcher"
	"github.com/kubeflow/metadata/watcher/handlers"
	"google.golang.org/grpc"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
	"sigs.k8s.io/controller-runtime/pkg/cache"
)

var (
	masterURL          string
	kubeconfig         string
	metadataServiceURL string
	resourcelist       string
)

func main() {
	klog.InitFlags(nil)
	flag.Parse()

	cfg, err := clientcmd.BuildConfigFromFlags(masterURL, kubeconfig)
	if err != nil {
		klog.Fatalf("Error building kubeconfig: %s", err.Error())
	}
	gvks, err := readGVKsFromFile(resourcelist)
	if err != nil {
		klog.Fatalf("Failed to get a list of GroupVersionKind from file %s: %s", resourcelist, err)
	}

	// Set up a connection to the gRPC server.
	conn, err := grpc.Dial(metadataServiceURL, grpc.WithInsecure())
	if err != nil {
		klog.Fatalf("Faild to connect grpc server: %v", err)
	}
	kfmdClient := storepb.NewMetadataStoreServiceClient(conn)
	stopCh := setupSignalHandler(conn)

	c, err := cache.New(cfg, cache.Options{})
	if err != nil {
		klog.Fatalf("Error building kubernetes cache: %s", err.Error())
	}
	cacheSynced := func() bool {
		return c.WaitForCacheSync(stopCh)
	}

	for _, gvk := range gvks {
		unstructuredJob := &unstructured.Unstructured{}
		unstructuredJob.SetGroupVersionKind(gvk)
		informer, err := c.GetInformer(unstructuredJob)
		if err != nil {
			klog.Fatalf("Failed to create informer for %s: %s", gvk, err)
		}
		metalogger, err := handlers.NewMetaLogger(kfmdClient, gvk)
		if err != nil {
			klog.Fatal("Failed to create metalogger for %v: %v", gvk, err)
		}
		w := watcher.New(gvk, metalogger)
		if err != nil {
			klog.Fatalf("Failed to create logger for %s: %s", gvk, err)
		}
		informer.AddEventHandler(w)
		go func(gvk schema.GroupVersionKind) {
			if err := w.Run(stopCh, cacheSynced); err != nil {
				klog.Fatalf("Failed to run watcher for %s: %s", gvk, err)
			}
		}(gvk)
	}
	klog.Infof("Started all informers...\n")
	c.Start(stopCh)
}

func readGVKsFromFile(filepath string) ([]schema.GroupVersionKind, error) {
	b, err := ioutil.ReadFile(filepath)
	if err != nil {
		return nil, err
	}
	var gvks []schema.GroupVersionKind
	err = json.Unmarshal(b, &gvks)
	if err != nil {
		return nil, err
	}
	return gvks, nil
}

func setupSignalHandler(conn *grpc.ClientConn) (stopCh <-chan struct{}) {
	stop := make(chan struct{})
	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		conn.Close()
		close(stop)
		<-c
		os.Exit(1) // second signal. Exit directly.
	}()
	return stop
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to a kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&masterURL, "master", "", "The address of the Kubernetes API server. Overrides any value in kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&metadataServiceURL, "metadata_service", "localhost:8080", "The address of the Kubeflow Metadata GRPC service.")
	flag.StringVar(&resourcelist, "resourcelist", "", "Path to a JSON file with a list of Kubernets GroupVersionKind to be watched.")
}
