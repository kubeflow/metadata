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

cd $(dirname $0)/..
rm -rf .testing-env
python3 -m venv .testing-env && \
source .testing-env/bin/activate && \
python3 -m pip install -U pip
python3 -m pip install pytest
# install local kubeflow.metadata package
python3 -m pip install -e .
python3 -m pytest tests/test.py
rm -rf .testing-env
