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
set -o xtrace

export PATH="$PATH:$HOME/bin"

bazel build -c opt --define=grpc_no_ares=true //...
bazel test -c opt --define=grpc_no_ares=true //...

# Check licenses
rm -f /tmp/generated_license.txt /tmp/generated_dep.txt

go list -m all | cut -d ' ' -f 1 > /tmp/generated_dep.txt

if ! diff /tmp/generated_dep.txt third_party_licenses/dep.txt; then
    echo "Please follow third_party_licenses/README.md to update the license file for changed dependencies."
    exit 1
fi

(cd third_party_licenses && python3 concatenate_license.py --output=/tmp/generated_license.txt)
if ! diff /tmp/generated_license.txt third_party/library/license.txt; then
    echo "Please follow third_party_licenses/README.md to regenerate third_party/library/license.txt."
    exit 1
fi
