#!/bin/bash

set -e

NAMESPACE=${NAMESPACE:-kubeflow}

cat << EOF
===============================================================================
This script helps set up a dev env for client side UI only. It uses a real KF deployment for api requests.

What this does:
1. It detects metadata ui pod name in a KF deployment.
2. Port forward metadata ui pod to localhost:8080 (Metadata UI dev env is configured to redirect all api requests to localhost:8080)
===============================================================================
EOF

echo "Detecting metadata ui pod name..."
METADATA_UI_POD=($(kubectl get pods -n $NAMESPACE -l app=metadata-ui -o=custom-columns=:.metadata.name --no-headers))
if [ -z "$METADATA_UI_POD" ]; then
  echo "Couldn't get metadata-ui pod in namespace '$NAMESPACE', double check the cluster your kubectl talks to and your namespace is correct."
  echo "Namespace can be configured by setting env variable NAMESPACE. e.g. '$ NAMESPACE=kfm npm run start:proxy'"
  exit 1
fi
echo "Metadata UI pod is $METADATA_UI_POD"

echo "Starting to port forward frontend server in a KF deployment to respond to apis..."
kubectl port-forward -n $NAMESPACE $METADATA_UI_POD 8080:3000
