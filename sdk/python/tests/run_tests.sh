#!/bin/bash -e
# Copyright 2019 kubeflow.org.
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

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

cd $(dirname $0)/..
python3 -m pip install -U pip
python3 -m pip install pytest
# install local kubeflow.metadata package
python3 -m pip install -e .
python3 -m pytest ./tests
# Run integration tests multiple times should get the same result.
echo "Run tests the second time:"
python3 -m pytest ./tests


# Test Notebook
python3 -m pip install papermill pandas jupyterlab nbconvert
papermill -p METADATA_STORE_HOST "127.0.0.1" -p METADATA_STORE_PORT 8081 sample/demo.ipynb tmp/demo_output.json
# Check note book success
NUM_EXEC=$(grep "cell_type" /tmp/demo_output.json | wc -l)
NUM_SUCCESS=$(grep "\"status\": \"completed\"" tmp/demo_output.json | wc -l)
if [ $((NUM_SUCCESS)) -ne $((NUM_EXEC)) ]
then
    cat /tmp/demo_output.json
    printf "Failed to execute demo.ipynb: ${NUM_SUCCESS} out of ${NUM_EXEC} cells succeeded.\n"
    exit 1
fi
