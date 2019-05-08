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
	mlmd "github.com/kubeflow/metadata/ml_metadata"
	"github.com/kubeflow/metadata/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	host     = flag.String("host", "localhost", "Hostname to listen on.")
	rpcPort  = flag.Int("rpc_port", 9090, "RPC serving port.")
	httpPort = flag.Int("http_port", 8080, "HTTP serving port.")
	mlmdAddr = flag.String("mlmd_address", "127.0.0.1:9090", "The server address of ml_metadata in the format of host:port")
)

func main() {
	flag.Parse()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	conn, err := grpc.Dial(*mlmdAddr, grpc.WithInsecure())
	if err != nil {
		glog.Fatalf("Fail to dial to MLMD server: %v.", err)
	}
	defer conn.Close()
	mlmdClient := mlmd.NewMetadataStoreServiceClient(conn)

	rpcEndpoint := fmt.Sprintf("%s:%d", *host, *rpcPort)
	rpcServer := grpc.NewServer()
	pb.RegisterMetadataServiceServer(rpcServer, service.NewService(mlmdClient))

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
	err = pb.RegisterMetadataServiceHandlerFromEndpoint(ctx, mux, rpcEndpoint, opts)
	if err != nil {
		glog.Fatal(err)
	}

	httpEndpoint := fmt.Sprintf("%s:%d", *host, *httpPort)
	glog.Infof("HTTP server listening on %s", httpEndpoint)
	err = http.ListenAndServe(httpEndpoint, mux)
	if err != nil {
		glog.Fatal(err)
	}
}
