[![Go Report Card](https://goreportcard.com/badge/github.com/kubeflow/metadata)](https://goreportcard.com/report/github.com/kubeflow/metadata)

# Metadata
Tracking and managing metadata of machine learning workflows in Kubeflow. For more information, you can visit [this page](https://www.kubeflow.org/docs/components/metadata/).

## Building & Testing
**Make sure to use the [Bazel 0.24.1](https://github.com/bazelbuild/bazel/releases/tag/0.24.1) version. If not,
follow the [instructions](https://docs.bazel.build/versions/master/install-ubuntu.html#step-3-run-the-installer) to
update your Bazel version.**

To build and test everything under the project using `Bazel`, run:
```
make build
make test
```

To update BUILD file rules, run:
```
bazel run //:gazelle -- update-repos -from_file=go.mod
```

To build and test everything using the `go` command, you must first build the
project using Bazel above. This will generate the necessary object libraries
that can be used by `cgo` when linking with Metadata's C++ dependencies. Once
Bazel has completed the build, you can build and test everything using `go`
as usual:
```
go build ./...
go test ./...
```

To run the server, run the following command:
```
go run server/main.go --logtostderr
```

Or to run with `bazel`:
```
bazel run --define=grpc_no_ares=true //server -- --logtostderr
```
