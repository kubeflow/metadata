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

    e = metadata.Execution(
        name="test execution",
        workspace=ws1,
        run=r,
        description="an execution",
    )
    assert e.id

    data_set = e.log_input(
        metadata.DataSet(
            description="an example data",
            name="mytable-dump",
            owner="owner@my-company.org",
            uri="file://path/to/dataset",
            version="v1.0.0",
            query="SELECT * FROM mytable"))
    assert data_set.id

    metrics = e.log_output(
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

    model = e.log_output(
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

    # Test listing artifacts in a workspace
    self.assertTrue(len(ws1.list()) > 0)
    self.assertTrue(len(ws1.list(metadata.Model.ARTIFACT_TYPE_NAME)) > 0)
    self.assertTrue(len(ws1.list(metadata.Metrics.ARTIFACT_TYPE_NAME)) > 0)
    self.assertTrue(len(ws1.list(metadata.DataSet.ARTIFACT_TYPE_NAME)) > 0)

    # Test lineage tracking.
    output_events = ws1.client.list_events2(model.id).events
    assert len(output_events) == 1
    execution_id = output_events[0].execution_id
    assert execution_id == e.id
    all_events = ws1.client.list_events(execution_id).events
    assert len(all_events) == 3

  def test_log_invalid_artifacts_should_fail(self):
    ws = metadata.Workspace(
    backend_url_prefix="127.0.0.1:8080",
    name="ws_1",
    description="a workspace for testing",
    labels={"n1": "v1"})
    e = metadata.Execution(name="test execution", workspace=ws)
    artifact1 = ArtifactFixture(openapi_client.MlMetadataArtifact(
        uri="gs://uri",
        custom_properties={
            metadata.WORKSPACE_PROPERTY_NAME:
            openapi_client.MlMetadataValue(string_value="ws1"),
        }
    ))
    self.assertRaises(ValueError, e.log_input, artifact1)
    artifact2 = ArtifactFixture(openapi_client.MlMetadataArtifact(
        uri="gs://uri",
        custom_properties={
            metadata.RUN_PROPERTY_NAME:
            openapi_client.MlMetadataValue(string_value="run1"),
        }
    ))
    self.assertRaises(ValueError, e.log_output, artifact2)

class ArtifactFixture(object):
  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/artifact_fixture"

  def __init__(self, serialization_fixture=None):
        self._fixture = serialization_fixture

  def serialization(self):
      return self._fixture

if __name__ == "__main__":
  unittest.main()
