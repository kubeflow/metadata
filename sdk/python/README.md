# Python Library

This directory contains the Python API for logging metadata of machine learning workflows to the Kubeflow Metadata service.

## Installation

You can install this Python library for logging metadata via the following command:
```
pip install kubeflow.metadata
```

## Releases
- 0.3.0 to be released with Kubeflow v0.1. ([doc](https://master.kubeflow.org/docs/components/misc/metadata/), [tutorial](https://github.com/kubeflow/metadata/blob/master/sdk/python/sample/demo.ipynb), [SDK Reference](https://kubeflow-metadata.readthedocs.io/en/latest/))

- 0.2.0 released with Kubeflow v0.6. ([doc](https://v0-6.kubeflow.org/docs/components/misc/metadata/), [tutorial](https://github.com/kubeflow/metadata/blob/v0.1.0/sdk/python/demo.ipynb))


## Concepts
- _Run_ describes an execution of a machine learning workflow, which can be a pipeline or a notebook.
- _Artifact_ describes derived data used or produced in a run.
- _Execution_ describes an execution of a single step of a run with its running parameters.
- _Workspace_ groups a set of runs and related artifacts and executions.


![Concepts](concepts.png)
