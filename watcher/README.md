The goal of a watcher is to extract metadata from a type of Kubernetes API objects and log it to Kubeflow Metadata service. This provides a way to separate metadata logging from the generation.

### Installation

Run `make deploy` to deploy the watcher into your Kubeflow cluster.

### Architecture
The architecture is shown below.

<img src="architecture.png" width=350>
