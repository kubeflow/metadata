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

	"ml_metadata/metadata_store/mlmetadata"
	mlpb "ml_metadata/proto/metadata_store_go_proto"

	"github.com/golang/glog"
	"github.com/golang/protobuf/proto"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	pb "github.com/kubeflow/metadata/api"
	"github.com/kubeflow/metadata/schemaparser"
	"github.com/kubeflow/metadata/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	rpcPort       = flag.Int("rpc_port", 9090, "RPC serving port.")
	httpPort      = flag.Int("http_port", 8080, "HTTP serving port.")
	schemaRootDir = flag.String("schema_root_dir", "schema/alpha", "Root directory for the predefined schemas.")

	mlmdDBType           = flag.String("mlmd_db_type", "mysql", "Database type to use when creating MLMD instance. Supported options: in-memory, mysql, sqlite")
	mlmdDBName           = flag.String("mlmd_db_name", "mlmetadata", "Database name to use when creating MLMD instance.")
	mySQLServiceHost     = flag.String("mysql_service_host", "localhost", "MySQL Service Hostname.")
	mySQLServicePort     = flag.Uint("mysql_service_port", 3306, "MySQL Service Port.")
	mySQLServiceUser     = flag.String("mysql_service_user", "root", "MySQL Service Username.")
	mySQLServicePassword = flag.String("mysql_service_password", "", "MySQL Service Password.")
	sqliteFilenameUri    = flag.String("sqlite_filename_uri", "mlmetadata", "Sqlite Filename URI")
	sqliteConnMode       = flag.Int("sqlite_conn_mode", 3, "Sqlite Connection Mode. Supported options: 0(UNKNOWN), 1(READONLY), 2(READWRITE), 3(READWRITE_OPENCREATE)")
)

func mlmdStoreOrDie() *mlmetadata.Store {
	var cfg *mlpb.ConnectionConfig
	switch *mlmdDBType {
	case "in-memory":
		cfg = &mlpb.ConnectionConfig{
			Config: &mlpb.ConnectionConfig_FakeDatabase{
				&mlpb.FakeDatabaseConfig{
				},
			},
		}
	case "mysql":
		cfg = &mlpb.ConnectionConfig{
			Config: &mlpb.ConnectionConfig_Mysql{
				&mlpb.MySQLDatabaseConfig{
					Host:     mySQLServiceHost,
					Port:     proto.Uint32(uint32(*mySQLServicePort)),
					Database: mlmdDBName,
					User:     mySQLServiceUser,
					Password: mySQLServicePassword,
				},
			},
		}
	case "sqlite":
		cfg = &mlpb.ConnectionConfig{
			Config: &mlpb.ConnectionConfig_Sqlite{
				&mlpb.SqliteMetadataSourceConfig{
					FilenameUri:    sqliteFilenameUri,
					ConnectionMode: mlpb.SqliteMetadataSourceConfig_ConnectionMode.Enum(mlpb.SqliteMetadataSourceConfig_ConnectionMode(*sqliteConnMode)),
				},
			},
		}
	default:
		glog.Fatalf("Unknown mlmd_db_type %q: please choose from [in-memory, mysql, sqlite]", *mlmdDBType)
	}

	store, err := mlmetadata.NewStore(cfg)
	if err != nil {
		glog.Fatalf("Failed to create ML Metadata Store with config %v: %v.\n", cfg, err)
	}
	return store
}

func main() {
	flag.Parse()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	service := service.New(mlmdStoreOrDie())

	predefinedTypes, err := schemaparser.RegisterSchemas(service, *schemaRootDir)
	if err != nil {
		glog.Fatalf("Failed to load predefined types: %v\n", err)
	}
	glog.Infof("Loaded predefined types: %v\n", predefinedTypes)

	rpcEndpoint := fmt.Sprintf(":%d", *rpcPort)
	rpcServer := grpc.NewServer()
	pb.RegisterMetadataServiceServer(rpcServer, service)

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
	if err := pb.RegisterMetadataServiceHandlerFromEndpoint(ctx, mux, rpcEndpoint, opts); err != nil {
		glog.Fatal(err)
	}

	httpEndpoint := fmt.Sprintf(":%d", *httpPort)
	glog.Infof("HTTP server listening on %s", httpEndpoint)
	if err := http.ListenAndServe(httpEndpoint, mux); err != nil {
		glog.Fatal(err)
	}
}
