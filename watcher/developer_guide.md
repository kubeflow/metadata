# Developer Guide

## Running Locally

You can run the watcher locally.

Port-forward a local port to the metadata service running inside the cluster

```
kubectl -n kubeflow port-forward service/metadata-grpc-service 8080:8080
```

Run the watcher

```
make build
./.build/watcher --kubeconfig=~/.kube/config \
   --resourcelist=./dockerfiles/resource_list.json
```

## Examples

You can submit an example job with annotations

```
kubectl create -f simple_job.yaml
```

After you run the job look in the KFP Executions and Artifacts UI's to see the artifacts and executions.