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
	"encoding/json"
	"flag"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
	"sigs.k8s.io/controller-runtime/pkg/cache"

	"github.com/kubeflow/metadata/resource_logger"
	kfmd "github.com/kubeflow/metadata/sdk/go/openapi_client"
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
	c, err := cache.New(cfg, cache.Options{})
	if err != nil {
		klog.Fatalf("Error building kubernetes cache: %s", err.Error())
	}

	gvks, err := readGVKsFromFile(resourcelist)
	if err != nil {
		klog.Fatalf("Failed to get a list of GroupVersionKind from file %s: %s", resourcelist, err)
	}

	kfmdClient := kfmdClient()

	for _, gvk := range gvks {
		unstructuredJob := &unstructured.Unstructured{}
		unstructuredJob.SetGroupVersionKind(gvk)
		informer, err := c.GetInformer(unstructuredJob)
		if err != nil {
			klog.Fatalf("Failed to create informer for %s: %s", gvk, err)
		}
		l, err := resource_logger.New(kfmdClient, gvk)
		if err != nil {
			klog.Fatalf("Failed to create logger for %s: %s", gvk, err)
		}
		informer.AddEventHandler(l)
	}
	klog.Infof("Start all informers...\n")
	c.Start(SetupSignalHandler())
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

// SetupSignalHandler registered for SIGTERM and SIGINT. A stop channel is returned
// which is closed on one of these signals. If a second signal is caught, the program
// is terminated with exit code 1.
func SetupSignalHandler() (stopCh <-chan struct{}) {
	stop := make(chan struct{})
	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		close(stop)
		<-c
		os.Exit(1) // second signal. Exit directly.
	}()
	return stop
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to a kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&masterURL, "master", "", "The address of the Kubernetes API server. Overrides any value in kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&metadataServiceURL, "metadata_service", "http://0.0.0.0:8080", "The address of the Kubeflow Metadata service.")
	flag.StringVar(&resourcelist, "resourcelist", "", "Path to a json file with a list of Kubernets GroupVersionKind to be watched.")
}
