import unittest
import uuid
from unittest.mock import patch

import ml_metadata
import pytest
from kubeflow.metadata import metadata
from ml_metadata.proto import metadata_store_pb2 as mlpb

GRPC_HOST = "127.0.0.1"
GRPC_PORT = 8081


class TestMetedata(unittest.TestCase):

  def test_log_metadata_successfully(self):
    store = metadata.Store(grpc_host=GRPC_HOST, grpc_port=GRPC_PORT)
    ws_name = "test_log_metadata_successfully_ws_" + str(uuid.uuid4())
    ws1 = metadata.Workspace(store=store,
                             name=ws_name,
                             description="a workspace for testing",
                             labels={"n1": "v1"})

    r = metadata.Run(
        workspace=ws1,
        name="first run",
        description="first run in ws_1",
    )

    trainer = metadata.Execution(
        name="test execution",
        workspace=ws1,
        run=r,
        description="an execution",
    )
    self.assertIsNotNone(trainer.id)

    data_set = trainer.log_input(
        metadata.DataSet(description="an example data",
                         name="mytable-dump",
                         owner="owner@my-company.org",
                         uri="file://path/to/dataset",
                         version=str(uuid.uuid4()),
                         query="SELECT * FROM mytable"))
    self.assertIsNotNone(data_set.id)
    self.assertIsNotNone(repr(data_set))

    metrics = trainer.log_output(
        metadata.Metrics(
            name="MNIST-evaluation",
            description=
            "validating the MNIST model to recognize handwritten digits",
            owner="someone@kubeflow.org",
            uri="gcs://my-bucket/mnist-eval.csv",
            data_set_id="123",
            model_id="12345",
            metrics_type=metadata.Metrics.VALIDATION,
            values={"accuracy": 0.95},
            labels={"mylabel": "l1"}))
    self.assertIsNotNone(metrics.id)
    self.assertIsNotNone(repr(metrics))
    print(repr(metrics))

    model_version = str(uuid.uuid4())
    model = trainer.log_output(
        metadata.Model(name="MNIST",
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
                       version=model_version,
                       labels={"mylabel": "l1"}))
    self.assertIsNotNone(model.id)
    self.assertIsNotNone(repr(model))

    serving_application = metadata.Execution(
        name="serving model",
        workspace=ws1,
        description="an execution to represent model serving component",
    )
    self.assertIsNotNone(serving_application.id)
    # Use model name, version, uri to uniquely identify existing model.
    served_model = metadata.Model(
        name="MNIST",
        uri="gcs://my-bucket/mnist",
        version=model_version,
    )
    serving_application.log_input(served_model)

    # Test listing artifacts in a workspace
    assert len(ws1.list()) > 0
    assert len(ws1.list(metadata.Model.ARTIFACT_TYPE_NAME)) > 0
    #assert len(ws1.list(metadata.Metrics.ARTIFACT_TYPE_NAME)) > 0
    assert len(ws1.list(metadata.DataSet.ARTIFACT_TYPE_NAME)) > 0

    # Test lineage tracking.
    model_events = ws1.store.get_events_by_artifact_ids([model.id])
    self.assertEqual(len(model_events), 2)
    execution_ids = set(e.execution_id for e in model_events)
    assert execution_ids == set([serving_application.id, trainer.id])
    trainer_events = ws1.store.get_events_by_execution_ids([trainer.id])
    artifact_ids = set(e.artifact_id for e in trainer_events)
    assert artifact_ids == set([model.id, metrics.id, data_set.id])

    # Test context, attributions, associations creation.
    ctx = ws1._get_existing_context()
    assert ctx.id is not None
    artifacts = ws1.store.get_artifacts_by_context(ctx.id)
    assert set(a.id for a in artifacts) == set(
        [model.id, metrics.id, data_set.id])
    executions = ws1.store.get_executions_by_context(ctx.id)
    assert set(e.id for e in executions) == set(
        [serving_application.id, trainer.id])

  def test_log_invalid_artifacts_should_fail(self):
    store = metadata.Store(grpc_host=GRPC_HOST, grpc_port=GRPC_PORT)
    ws = metadata.Workspace(store=store,
                            name="ws_1",
                            description="a workspace for testing",
                            labels={"n1": "v1"})
    e = metadata.Execution(name="test execution", workspace=ws)
    artifact1 = ArtifactFixture(
        mlpb.Artifact(uri="gs://uri",
                      custom_properties={
                          metadata._WORKSPACE_PROPERTY_NAME:
                              mlpb.Value(string_value="ws1"),
                      }))
    self.assertRaises(ValueError, e.log_input, artifact1)
    artifact2 = ArtifactFixture(
        mlpb.Artifact(uri="gs://uri",
                      custom_properties={
                          metadata._RUN_PROPERTY_NAME:
                              mlpb.Value(string_value="run1"),
                      }))
    self.assertRaises(ValueError, e.log_output, artifact2)

  def test_log_metadata_successfully_with_minimum_information(self):
    store = metadata.Store(grpc_host=GRPC_HOST, grpc_port=GRPC_PORT)
    ws1 = metadata.Workspace(store=store, name="ws_1")
    r = metadata.Run(workspace=ws1, name="first run")
    e = metadata.Execution(name="test execution", workspace=ws1, run=r)
    self.assertIsNotNone(e.id)

    data_set = e.log_input(
        metadata.DataSet(name="mytable-dump", uri="file://path/to/dataset"))
    self.assertIsNotNone(data_set.id)
    data_set_id = data_set.id
    # ID should not change after logging twice.
    e.log_input(data_set)
    self.assertEqual(data_set_id, data_set.id)

    metrics = e.log_output(
        metadata.Metrics(name="MNIST-evaluation",
                         uri="gcs://my-bucket/mnist-eval.csv"))
    self.assertIsNotNone(metrics.id)
    metrics_id = metrics.id
    # ID should not change after logging twice.
    e.log_output(metrics)
    self.assertEqual(metrics_id, metrics.id)

    model = e.log_output(
        metadata.Model(name="MNIST", uri="gcs://my-bucket/mnist"))
    self.assertIsNotNone(model.id)
    model_id = model.id
    # ID should not change after logging twice.
    e.log_output(model)
    self.assertEqual(model_id, model.id)

  def test_invalid_workspace_should_fail(self):
    with self.assertRaises(ValueError):
      ws1 = metadata.Workspace(name="ws_1",
                               description="a workspace for testing",
                               labels={"n1": "v1"})

    with self.assertRaises(ValueError):
      ws1 = metadata.Workspace(store="127.1.0.1:8080",
                               name="ws_1",
                               description="a workspace for testing",
                               labels={"n1": "v1"})

  def test_creating_workspace_with_existing_name(self):
    store = metadata.Store(grpc_host=GRPC_HOST, grpc_port=GRPC_PORT)
    ws_name = "non_unique_ws_" + str(uuid.uuid4())
    ws1 = metadata.Workspace(store=store,
                             name=ws_name,
                             description="a workspace for testing",
                             labels={"n1": "v1"})

    ws2 = metadata.Workspace(store, ws_name)
    assert ws1.context_id == ws2.context_id

    with pytest.raises(ValueError, match=r".*exists with id.*"):
      metadata.Workspace(store, ws_name, reuse_workspace_if_exists=False)

  def test_init_store_with_ssl_config(self):
    # TODO: There is a type error in underlying ml_metadate library:
    #   TypeError: expected certificate to be bytes, got <class 'str'>
    # Fix this unit test once this bug is fixed.
    with self.assertRaises(TypeError):
      metadata.Store(grpc_host=GRPC_HOST,
                     grpc_port=GRPC_PORT,
                     root_certificates=b"cert",
                     private_key=b"private_key",
                     certificate_chain=b"chain")
    with patch('ml_metadata.metadata_store.metadata_store.MetadataStore',
               new=CheckMetadataStore) as m:
      metadata.Store(grpc_host=GRPC_HOST,
                     grpc_port=GRPC_PORT,
                     root_certificates=b"cert",
                     private_key=b"private_key",
                     certificate_chain=b"chain")

  def test_artifact_deduplication(self):
    store = metadata.Store(grpc_host=GRPC_HOST, grpc_port=GRPC_PORT)
    ws1 = metadata.Workspace(store=store, name="workspace_one")
    ws2 = metadata.Workspace(store=store, name="workspace_two")
    r = metadata.Run(workspace=ws1, name="first run")
    e = metadata.Execution(name="test execution", workspace=ws1, run=r)
    e2 = metadata.Execution(name="execution 2", workspace=ws1)
    e3 = metadata.Execution(name="execution 3", workspace=ws2)
    self.assertIsNotNone(e.id)
    self.assertIsNotNone(e2.id)

    model = metadata.Model(name="MNIST",
                           uri="gcs://my-bucket/mnist",
                           model_type="neural network",
                           version="v0.0.1")
    model2 = metadata.Model(name="MNIST",
                            uri="gcs://my-bucket/mnist",
                            model_type="neural network",
                            version="v0.0.1")
    e.log_output(model)
    self.assertIsNotNone(model.id)
    e2.log_output(model2)
    self.assertIsNotNone(model2.id)
    self.assertEqual(model.id, model2.id)

  def test_is_duplicated_methods(self):
    for cls in [metadata.Model, metadata.DataSet]:
      m = mlpb_artifact(1, "gcs://123", "ws1", "name1", "v1")
      m1 = mlpb_artifact(1, "gcs://123", "ws1", "name1", "v1")
      self.assertTrue(cls.is_duplicated(m, m1))
      m2 = mlpb_artifact(1, "gcs://123", "ws1", "name1")
      self.assertFalse(cls.is_duplicated(m, m2))
      m3 = mlpb_artifact(1, "gcs://123", "ws1", "name2", "v1")
      self.assertFalse(cls.is_duplicated(m, m3))
      m4 = mlpb_artifact(1, "gcs://123", "ws2", "name1", "v1")
      self.assertFalse(cls.is_duplicated(m, m4))
      m5 = mlpb_artifact(1, "gcs://1234", "ws1", "name1", "v1")
      self.assertFalse(cls.is_duplicated(m, m5))
      m6 = mlpb_artifact(2, "gcs://123", "ws1", "name1", "v1")
      self.assertFalse(cls.is_duplicated(m, m6))


class CheckMetadataStore(object):

  def __init__(self, config, disable_upgrade_migration=None):
    assert disable_upgrade_migration is not None
    assert config.ssl_config is not None
    assert config.ssl_config.custom_ca is not None
    assert config.ssl_config.client_key is not None
    assert config.ssl_config.server_cert is not None


class ArtifactFixture(object):
  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/artifact_fixture"

  def __init__(self, serialization_fixture=None):
    self._fixture = serialization_fixture

  def serialization(self):
    return self._fixture


def mlpb_artifact(type_id, uri, workspace, name=None, version=None):
  properties = {}
  if name:
    properties["name"] = mlpb.Value(string_value=name)
  if version:
    properties["version"] = mlpb.Value(string_value=version)
  return mlpb.Artifact(uri=uri,
                       type_id=type_id,
                       properties=properties,
                       custom_properties={
                           metadata._WORKSPACE_PROPERTY_NAME:
                               mlpb.Value(string_value=workspace),
                       })


if __name__ == "__main__":
  unittest.main()
