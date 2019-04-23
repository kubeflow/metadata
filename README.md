[![Go Report Card](https://goreportcard.com/badge/github.com/kubeflow/metadata)](https://goreportcard.com/report/github.com/kubeflow/metadata)

# Metadata
Repository for assets related to Metadata.

## Building & Testing
To build and test everything under the project using `Bazel`, run:
```
bazel build -c opt //...
bazel test -c opt //...
```

To update BUILD file rules, run:
```
bazel run //:gazelle
```

To build and test everything using the `go` command:
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
bazel run //server -- --logtostderr
```
