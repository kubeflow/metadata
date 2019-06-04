#!/bin/bash

# Copyright 2018 The Kubernetes Authors.
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

# This script is used to send requests to a Kubeflow metadata server to
# verify it works.

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

HOST=http://localhost
PORT=8080

# TODO(zhenghuiwang): this is expected to return all predefined types, but it
# returns {} now.
curl -H "ContentType: application/json" $HOST:$PORT/api/v1alpha1/artifact_types

# List the predefined model type.
curl -H "ContentType: application/json" $HOST:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model

# Add a model artifact
curl -X POST -H "ContentType: application/json" $HOST:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts -d @artifact_model_1.json

# List all model artifacts
curl -H "ContentType: application/json" $HOST:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts

# Get the model artifcat with ID=1.
curl -H "ContentType: application/json" $HOST:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts/1
