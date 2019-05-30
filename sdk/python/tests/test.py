import metadata
import unittest

class TestMetedata(unittest.TestCase):

  def test_log_metadata(self):
    ws1 = metadata.Workspace(backend_url_prefix="127.0.0.1:8080",
                            name="ws_1",
                            description="a workspace for testing",
                            labels={"n1": "v1"})
    r = metadata.Run(
        workspace=ws1,
        name="first run",
        description="first run in ws_1",
    )

    r.log_data_set(metadata.DataSet(
        description="an example data",
        name="mytable-dump",
        owner="owner@my-company.org",
        uri="file://path/to/dataset",
        version="v1.0.0",
        query="SELECT * FROM mytable"
    ))

    r.log_metrics(
        metadata.Metrics(
            name="MNIST-evaluation",
            description="validating the MNIST model to recognize handwritten digits",
            owner="someone@kubeflow.org",
            uri="gcs://my-bucket/mnist-eval.csv",
            data_set_id="123",
            model_id="12345",
            metrics_type=metadata.Metrics.VALIDATION,
            values={
                "accuracy": 0.95},
            labels={
                "mylabel": "l1"}))

    r.log_model(metadata.Model(
                name="MNIST",
                description="model to recognize handwritten digits",
                owner="someone@kubeflow.org",
                uri="gcs://my-bucket/mnist",
                model_type="neural network",
                training_framework={
                    "name": "tensorflow",
                    "version": "v1.0"
                },
                hyperparameters={
                    "learning_rate": 0.5,
                    "layers": [
                        10,
                        3,
                        1
                    ],
                    "early_stop": True
                },
                version="v0.0.1",
                labels={
                    "mylabel": "l1"
                }
                ))

if __name__ == '__main__':
    unittest.main()
