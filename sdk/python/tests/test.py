import unittest
import openapi_client
from kfmd import metadata


class TestMetedata(unittest.TestCase):

  def test_log_metadata_successfully(self):
    ws1 = metadata.Workspace(
        backend_url_prefix="127.0.0.1:8080",
        name="ws_1",
        description="a workspace for testing",
        labels={"n1": "v1"})

    r = metadata.Run(
        workspace=ws1,
        name="first run",
        description="first run in ws_1",
    )

    data_set = r.log(
        metadata.DataSet(
            description="an example data",
            name="mytable-dump",
            owner="owner@my-company.org",
            uri="file://path/to/dataset",
            version="v1.0.0",
            query="SELECT * FROM mytable"))
    assert data_set.id

    metrics = r.log(
        metadata.Metrics(
            name="MNIST-evaluation",
            description="validating the MNIST model to recognize handwritten digits",
            owner="someone@kubeflow.org",
            uri="gcs://my-bucket/mnist-eval.csv",
            data_set_id="123",
            model_id="12345",
            metrics_type=metadata.Metrics.VALIDATION,
            values={"accuracy": 0.95},
            labels={"mylabel": "l1"}))
    assert metrics.id

    model = r.log(
        metadata.Model(
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
                "layers": [10, 3, 1],
                "early_stop": True
            },
            version="v0.0.1",
            labels={"mylabel": "l1"}))
    assert model.id

    self.assertTrue(len(ws1.list()) > 0)
    self.assertTrue(len(ws1.list(metadata.Model.ARTIFACT_TYPE_NAME)) > 0)
    self.assertTrue(len(ws1.list(metadata.Metrics.ARTIFACT_TYPE_NAME)) > 0)
    self.assertTrue(len(ws1.list(metadata.DataSet.ARTIFACT_TYPE_NAME)) > 0)

  def test_log_invalid_artifacts_should_fail(self):
    r = metadata.Run(name="test run")
    artifact1 = ArtifactFixture(openapi_client.MlMetadataArtifact(
        uri="gs://uri",
        custom_properties={
            r.WORKSPACE_PROPERTY_NAME:
            openapi_client.MlMetadataValue(string_value="ws1"),
        }
    ))
    self.assertRaises(ValueError, r.log, artifact1)
    artifact2 = ArtifactFixture(openapi_client.MlMetadataArtifact(
        uri="gs://uri",
        custom_properties={
            r.RUN_PROPERTY_NAME:
            openapi_client.MlMetadataValue(string_value="run1"),
        }
    ))
    self.assertRaises(ValueError, r.log, artifact2)

class ArtifactFixture(object):
  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/artifact_fixture"

  def __init__(self, serialization_fixture=None):
        self._fixture = serialization_fixture

  def serialization(self):
      return self._fixture

if __name__ == "__main__":
  unittest.main()
