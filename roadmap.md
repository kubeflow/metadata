# Roadmap for v0.6

1. CUJ.The CUJ is to track model development in Notebook and Kubeflow Pipeline. ([deck](http://bit.ly/kf-meta-cuj))

2. API and metadata specifications. The goal is to define API and a set of built-in metadata specifications that can support the CUJ above; The API should be able to handle customized metadata specifications.(issues [#4](https://github.com/kubeflow/metadata/issues/4) [#5](https://github.com/kubeflow/metadata/issues/5))

3. Implementations. We plan to leverage [MLMD](https://github.com/google/ml-metadata) for an implementation of the API, because it is already used by Kubeflow Pipeline. Different implementations are welcome and should be easily discoverable.(issues [#8](https://github.com/kubeflow/metadata/issues/8) [#9](https://github.com/kubeflow/metadata/issues/9))

4. Python library. We plan to create a Python library for logging metadata in Notebook and Kubeflow Pipeline.(issue [#6](https://github.com/kubeflow/metadata/issues/6))

5. User interface. We plan to have a page in Kubeflow dashboard to show models and workflows in Notebook and Kubeflow Pipeline. (issue [#7](https://github.com/kubeflow/metadata/issues/7))
