# Roadmap for v0.6

1. CUJ.The CUJ is to track model development in Notebook and Kubeflow Pipeline. [(deck)](http://bit.ly/kf-meta-cuj)

2. API and metadata specifications. The goal is to define a set of API and built-in metadata specifications that can support the CUJ above; The API should also be extensible to customized metadata specification.

3. Implementations. We plan to leverage MLMD for an implementation of the API, because it is already used by Kubeflow Pipeline. Different implementations are welcome and should be easily discoverable.

4. Python library. We plan to create a Python library for logging metadata in Notebook and Kubeflow Pipeline.

5. User interface. We plan to have a page in Kubeflow dashboard to show models and workflows in Notebook and Kubeflow Pipeline.