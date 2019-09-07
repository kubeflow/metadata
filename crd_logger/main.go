/*
Copyright 2017 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"time"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	toolscache "k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
	"sigs.k8s.io/controller-runtime/pkg/cache"

	kfmd "github.com/kubeflow/metadata/sdk/go/openapi_client"
)

var (
	masterURL          string
	kubeconfig         string
	metadataServiceURL string
)

func main() {
	klog.InitFlags(nil)
	flag.Parse()

	cfg, err := clientcmd.BuildConfigFromFlags(masterURL, kubeconfig)
	if err != nil {
		klog.Fatalf("Error building kubeconfig: %s", err.Error())
	}
	c, err := cache.New(cfg, cache.Options{})
	if err != nil {
		klog.Fatalf("Error building kubernetes cache: %s", err.Error())
	}

	kfmdClient := kfmdClient()

	if err := registerMetadataTypes(kfmdClient); err != nil {
		klog.Fatalf("error registering metadata types: %s", err)
	}

	stopper := make(chan struct{})
	defer close(stopper)
	// podGVK := schema.GroupVersionKind{
	// 	Version: "v1",
	// 	Kind:    "Pod",
	// }
	// informerPod, err := c.GetInformerForKind(podGVK)
	// if err != nil {
	// 	klog.Fatalf("failed to create informer: %s", err)
	// }
	// informerPod.AddEventHandler(toolscache.ResourceEventHandlerFuncs{
	// 	AddFunc: func(obj interface{}) {
	// 		// "k8s.io/apimachinery/pkg/apis/meta/v1" provides an Object
	// 		// interface that allows us to get metadata easily
	// 		log.Printf("New Pod object %s", obj)
	// 	},
	// })

	fooGVK := schema.GroupVersionKind{
		Group:   "samplecontroller.k8s.io",
		Version: "v1alpha1",
		Kind:    "Foo",
	}
	unstructuredJob := &unstructured.Unstructured{}
	unstructuredJob.SetGroupVersionKind(fooGVK)

	informerFoo, err := c.GetInformer(unstructuredJob)
	if err != nil {
		klog.Fatalf("failed to create informer: %s", err)
	}
	informerFoo.AddEventHandler(toolscache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			// "k8s.io/apimachinery/pkg/apis/meta/v1" provides an Object
			// interface that allows us to get metadata easily
			log.Printf("New Foo object %s", obj)
		},
	})
	klog.Infof("Start informers...\n")
	c.Start(stopper)
	// unstructuredJob := &unstructured.Unstructured{}
	// unstructuredJob.SetGroupVersionKind(fooGVK)
	// fooKind := &source.Kind{Type: unstructuredJob}
	// wq := workqueue.NewNamedRateLimitingQueue(workqueue.DefaultControllerRateLimiter(), "logger_worker_queue")
	// err = fooKind.Start(handler.Funcs, wq)
}

func kfmdClient() *kfmd.APIClient {
	tr := &http.Transport{
		MaxIdleConns:       10,
		IdleConnTimeout:    30 * time.Second,
		DisableCompression: true,
	}
	httpclient := &http.Client{Transport: tr}
	cfg := &kfmd.Configuration{
		BasePath:      metadataServiceURL,
		DefaultHeader: make(map[string]string),
		UserAgent:     "OpenAPI-Generator/1.0.0/go",
		HTTPClient:    httpclient,
	}
	return kfmd.NewAPIClient(cfg)
}

func registerMetadataTypes(kfmdClient *kfmd.APIClient) error {
	resourceArtifactType := kfmd.MlMetadataArtifactType{
		Name: "kubeflow.org/_k8s_resource/alpha",
		Properties: map[string]kfmd.MlMetadataPropertyType{
			"name":   kfmd.STRING,
			"config": kfmd.STRING,
		},
	}
	resp, _, err := kfmdClient.MetadataServiceApi.CreateArtifactType(context.Background(), resourceArtifactType)
	if err == nil {
		klog.Infof("Registered kubeflow metadata type: %s", resp)
	}
	return err
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to a kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&masterURL, "master", "", "The address of the Kubernetes API server. Overrides any value in kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&metadataServiceURL, "metadata_service", "http://0.0.0.0:8080", "The address of the Kubeflow Metadata service.")
}
