### ML Metadata Library

This is a copy of the [ML Metadata Go library]
(https://github.com/google/ml-metadata) that is depended upon by the Metadata
server as its storage backend. MLMD is built using C++, and hence building
the Metadata server requires the Bazel build tool. This copy in third_party
exists to enable developers to use standard `Go` tooling to build and test
the server. In order for this to work, the file metadata_store_go_wrap.go
contains the relevant CGO flags that tells the `go` build tool where to find
the necessary C++ include headers and shared libraries when building MLMD.

If you are upgrading MLMD, ensure that when you copy
metadata_store_go_wrap.go to this directory, the relevant CGO flags (the
lines that begin with `#cgo`) in the current file are transferred to the new
copy.