# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# !/bin/sh

# This file generates API sources from the protocol buffers defined in this
# directory using Bazel, then copies them back into the source tree so they can
# be checked-in.

set -e
set -x
BAZEL_BINDIR=$(bazel info bazel-bin)
AUTOGEN_CMD="${BAZEL_BINDIR}/external/com_github_mbrukman_autogen/autogen_tool"
GENERATED_GO_PROTO_FILES="${BAZEL_BINDIR}/api/api_generated_go_sources/src/github.com/kubeflow/metadata/api/*.go"
GENERATED_SWAGGER_FILES="${BAZEL_BINDIR}/api/*.swagger.json"

WORKING_DIRECTORY="$(cd $(dirname "${BASH_SOURCE[0]}") && pwd )"
cd "${WORKING_DIRECTORY}"

# Delete currently generated code.
rm -r -f *.go

# Build required tools.
bazel build @com_github_mbrukman_autogen//:autogen_tool

# Build .pb.go and .gw.pb.go files from the proto sources.
bazel build //api:api_generated_go_sources

# Generate Swagger for REST API
bazel build //api:api_proto_gen_swagger

# Copy the generated files into the source tree and add license.
for GENERATED_FILE in $GENERATED_GO_PROTO_FILES; do
  TARGET=$(basename "${GENERATED_FILE}")
  cp "${GENERATED_FILE}" "${TARGET}"
  chmod 644 "${TARGET}"
  "${AUTOGEN_CMD}" -i --no-tlc -c "Google LLC" -l apache "${TARGET}"
done

# Copy the generated files into source tree. JSON can't have comments on
# license.
for GENERATED_FILE in $GENERATED_SWAGGER_FILES; do
  TARGET=$(basename "${GENERATED_FILE}")
  cp "${GENERATED_FILE}" "${TARGET}"
  # Fix incorrectly generated HTTP path in swagger file due to
  # https://github.com/grpc-ecosystem/grpc-gateway/issues/407 by
  #
  # replacing HTTP path pattern "/{VAR=abc/**}..." with "/abc/{VAR}...".
  sed -r --in-place 's/\{(\w+)=(\w+)\/\*\*\}/\2\/\{\1\}/g;' "${TARGET}"
  # replacing HTTP path pattern "/{VAR=abc/**/def/*}..." with "/abc/{VAR}..."
  sed -r --in-place 's/\{(\w+)=(\w+)\/\*\*\/(\w+)\/\*\}/\2\/\{\1\}/g;' "${TARGET}"
done

# Finally, run gazelle to add BUILD files for the generated code.
bazel run //:gazelle
