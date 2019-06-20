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

# This shell script is used to create docker images to run the metadata service.

set -o errexit
set -o nounset
set -o pipefail

CLUSTER_NAME="${CLUSTER_NAME}"
ZONE="${GCP_ZONE}"
PROJECT="${GCP_PROJECT}"
NAMESPACE="${DEPLOY_NAMESPACE}"
REGISTRY="${GCP_REGISTRY}"
VERSION=$(git describe --tags --always --dirty)
VERSION=${VERSION/%?/}

#TODO: remove to use the image just built
VERSION="latest"

echo "Activating service-account"
gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}

echo "Configuring kubectl"

echo "CLUSTER_NAME: ${CLUSTER_NAME}"
echo "ZONE: ${GCP_ZONE}"
echo "PROJECT: ${GCP_PROJECT}"

gcloud --project ${PROJECT} container clusters get-credentials ${CLUSTER_NAME} \
  --zone ${ZONE}
kubectl config set-context $(kubectl config current-context) --namespace=default
USER=`gcloud config get-value account`

kubectl apply -f - << EOF
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: cluster-admins
subjects:
- kind: User
  name: $USER
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: ""
EOF

echo "REGISTRY ${REGISTRY}"
echo "REPO_NAME ${REPO_NAME}"
echo "VERSION ${VERSION}"

cd "${MANIEFESTS_DIR}"

sed -i -e "s@image: gcr.io\/kubeflow-images-public\/metadata:v.*@image: ${GCP_REGISTRY}\/${REPO_NAME}\/metadata:${VERSION}@" metadata/base/metadata-deployment.yaml
sed -i -e "s@--mysql_service_host=metadata-db.default@--mysql_service_host=metadata-db.kubeflow@" metadata/base/metadata-deployment.yaml

cat metadata/base/metadata-deployment.yaml

cd metadata/base

kustomize build . | kubectl apply -n kubeflow -f -

TIMEOUT=120
PODNUM=$(kubectl get deploy -n kubeflow | grep -v NAME | wc -l)
until kubectl get pods -n kubeflow | grep Running | [[ $(wc -l) -eq $PODNUM ]]; do
    echo Pod Status $(kubectl get pods -n kubeflow | grep "1/1" | wc -l)/$PODNUM

    sleep 10
    TIMEOUT=$(( TIMEOUT - 1 ))
    if [[ $TIMEOUT -eq 0 ]];then
        echo "NG"
        kubectl get pods -n kubeflow
        exit 1
    fi
done

kubectl version
kubectl -n kubeflow get deploy
kubectl -n kubeflow get svc
kubectl -n kubeflow get pod

# Port forwading
kubectl -n kubeflow port-forward $(kubectl -n kubeflow get pod -o=name | grep metadata-deployment | sed -e "s@pods\/@@" | head -1) 8080:8080 &
echo "kubectl port-forward start"
sleep 5
TIMEOUT=120
until curl localhost:6789 || [ $TIMEOUT -eq 0 ]; do
    sleep 5
    TIMEOUT=$(( TIMEOUT - 1 ))
done

# Run CURL tests
cd "${SRC_DIR}/test/e2e" && sh make_requests.sh
# Run Python tests
pip install pandas
cd "${SRC_DIR}/sdk/python" && sh tests/run_tests.sh

exit 0
