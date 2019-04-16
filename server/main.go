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

// Package main is the main binary for the API server.
package main

import (
	"context"
	"flag"
	"fmt"
	"net"
	"net/http"

	"github.com/golang/glog"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	pb "github.com/kubeflow/metadata/api"
	"github.com/kubeflow/metadata/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	host     = flag.String("host", "localhost", "Hostname to listen on.")
	rpcPort  = flag.Int("rpc_port", 9090, "RPC serving port.")
	httpPort = flag.Int("http_port", 8080, "HTTP serving port.")
)

func main() {
	flag.Parse()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	rpcEndpoint := fmt.Sprintf("%s:%d", *host, *rpcPort)

	rpcServer := grpc.NewServer()
	pb.RegisterMetadataServiceServer(rpcServer, &service.Service{})

	go func() {
		listen, err := net.Listen("tcp", rpcEndpoint)
		if err != nil {
			glog.Fatal(err)
		}
		reflection.Register(rpcServer)
		if err := rpcServer.Serve(listen); err != nil {
			glog.Fatal(err)
		}
	}()

	mux := runtime.NewServeMux()

	opts := []grpc.DialOption{grpc.WithInsecure()}
	err := pb.RegisterMetadataServiceHandlerFromEndpoint(ctx, mux, rpcEndpoint, opts)
	if err != nil {
		glog.Fatal(err)
	}

	httpEndpoint := fmt.Sprintf("%s:%d", *host, *httpPort)
	glog.Infof("HTTP server listening on %s", httpEndpoint)
	http.ListenAndServe(httpEndpoint, mux)
}
