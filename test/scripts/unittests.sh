#!/bin/bash

# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This shell script is used to build a cluster and create a namespace from our
# argo workflow

set -o errexit
set -o nounset
set -o pipefail

export PATH="$PATH:$HOME/bin"

# TODO(zhenghui): add java into the testing worker image and generate swagger client.
# make swagger-py-client

bazel build -c opt --define=grpc_no_ares=true //...
bazel test -c opt --define=grpc_no_ares=true //...
