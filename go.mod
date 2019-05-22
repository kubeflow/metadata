module github.com/kubeflow/metadata

go 1.12

replace ml_metadata => ./third_party/ml_metadata

require (
	github.com/bmatcuk/doublestar v1.1.1
	github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b
	github.com/golang/mock v1.3.1
	github.com/golang/protobuf v1.3.1
	github.com/google/go-cmp v0.2.0
	github.com/grpc-ecosystem/grpc-gateway v1.8.3
	github.com/xeipuuv/gojsonpointer v0.0.0-20180127040702-4e3ac2762d5f // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.1.0
	golang.org/x/net v0.0.0-20190311183353-d8887717615a
	golang.org/x/sync v0.0.0-20190423024810-112230192c58
	google.golang.org/appengine v1.4.0 // indirect
	google.golang.org/genproto v0.0.0-20190415143225-d1146b9035b9
	google.golang.org/grpc v1.20.1
	gopkg.in/yaml.v2 v2.2.2 // indirect
	ml_metadata v0.0.0-00010101000000-000000000000
)
