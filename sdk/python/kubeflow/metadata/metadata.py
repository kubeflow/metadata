# Copyright 2019 kubeflow.org.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
import json
from abc import ABC, abstractmethod
from typing import Any, List, Mapping, Optional, TypeVar, Union

import ml_metadata
from ml_metadata.metadata_store import metadata_store
from ml_metadata.proto import metadata_store_pb2 as mlpb
from retrying import retry
"""This module contains the Python API for logging metadata of machine learning
workflows to the Kubeflow Metadata service.
"""

_WORKSPACE_PROPERTY_NAME = '__kf_workspace__'
_RUN_PROPERTY_NAME = '__kf_run__'
_ALL_META_PROPERTY_NAME = '__ALL_META__'


class Artifact(ABC):

  @property
  @classmethod
  @abstractmethod
  def ARTIFACT_TYPE_NAME(cls) -> str:
    pass

  @abstractmethod
  def serialization(self) -> mlpb.Artifact:
    pass

  @staticmethod
  def is_duplicated(a: mlpb.Artifact, b: mlpb.Artifact):
    '''Checks if two artifacts are duplicated.

    The artifacts may be considered duplication even if not all the fields are
    the same as in mlpb.Artifact. For example, two models can be considered the
    same if they have the same uri, name and version.

    Returns:
      True or False for duplication.
    '''
    return False


class Store(object):
  """Metadata Store that connects to the Metadata gRPC service."""

  def __init__(self,
               grpc_host: str = "metadata-grpc-service.kubeflow",
               grpc_port: int = 8080,
               root_certificates: Optional[bytes] = None,
               private_key: Optional[bytes] = None,
               certificate_chain: Optional[bytes] = None):
    """
    Args:
      grpc_host: Required gRPC service host, e.g."metadata-grpc-service.kubeflow".
      grpc_host: Required gRPC service port.
      root_certificates: Optional SSL certificate for secure connection.
      private_key: Optional private_key for secure connection.
      certificate_chain: Optional certificate_chain for secure connection.

    The optional parameters are the same as in grpc.ssl_channel_credentials.
    https://grpc.github.io/grpc/python/grpc.html#grpc.ssl_channel_credentials
    """
    config = mlpb.MetadataStoreClientConfig()
    config.host = grpc_host
    config.port = grpc_port
    if private_key:
      config.ssl_config.client_key = private_key
    if root_certificates:
      config.ssl_config.custom_ca = root_certificates
    if certificate_chain:
      config.ssl_config.server_cert = certificate_chain

    self.store = metadata_store.MetadataStore(config)


class Workspace(object):
  """Groups a set of runs of pipelines, notebooks and their related artifacts
  and executions.
  """
  CONTEXT_TYPE_NAME = "kubeflow.org/alpha/workspace"

  def __init__(self,
               store: Store = None,
               name: str = None,
               description: Optional[str] = None,
               labels: Optional[Mapping[str, str]] = None,
               reuse_workspace_if_exists: Optional[bool] = True,
               backend_url_prefix: Optional[str] = None):
    """
    Args:
      store: Required store object to connect to MLMD gRPC service.
      name: Required name for the workspace.
      description: Optional string for description of the workspace.
      labels: Optional key/value string pairs to label the workspace.
      reuse_workspace_if_exists: Optional boolean value to indicate whether a
        workspace of the same name should be reused.
      backend_url_prefix: Deprecated. Please use 'store' parameter.

    Raises:
      ValueError: If a workspace of the same name already exists and
      `reuse_workspace_if_exists` is set to False.
    """
    if backend_url_prefix:
      raise ValueError(
          "'backend_url_prefix' is deprecated. Please set Metadata.Store "
          "parameter to connect to the metadata gRPC service.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    if not store or type(store) != Store:
      raise ValueError("'store' must be set as metadata.Store")
    self.store = store.store
    self.name = name
    self.description = description
    self.labels = labels
    self.context_id = self._get_context_id(reuse_workspace_if_exists)

  def list(self, artifact_type_name: str = None) -> List[Artifact]:
    """List all artifacts of a given type.

    Args:
      artifact_type_name {str} name of artifact type.
      Returns a list of artifacts of the provided typed associated
      with this workspace. Each artifact is represented as a dict.

    Returns:
      A list of Artifact objects.
    """
    if artifact_type_name is None:
      artifact_type_name = Model.ARTIFACT_TYPE_NAME
    response = _retry(
        lambda: self.store.get_artifacts_by_type(artifact_type_name))
    results = []
    for artifact in response:
      flat = self._flat(artifact)
      if "workspace" in flat and flat["workspace"] == self.name:
        results.append(flat)
    return results

  def _flat(self, artifact):
    if artifact is None:
      raise ValueError("'artifact' must be set.")
    result = {
        "id": artifact.id,
    }
    if artifact.custom_properties is not None:
      if _WORKSPACE_PROPERTY_NAME in artifact.custom_properties:
        result["workspace"] = artifact.custom_properties[
            _WORKSPACE_PROPERTY_NAME].string_value
      if _RUN_PROPERTY_NAME in artifact.custom_properties:
        result["run"] = artifact.custom_properties[
            _RUN_PROPERTY_NAME].string_value
    if not artifact.properties:
      return result
    for k, v in artifact.properties.items():
      if k != _ALL_META_PROPERTY_NAME:
        if v.string_value is not None:
          result[k] = v.string_value
        elif v.int_value is not None:
          result[k] = v.int_value
        else:
          result[k] = v.double_value
    if not _ALL_META_PROPERTY_NAME in artifact.properties:
      return result
    # Pick up all nested objects stored in the __ALL_META__ field.
    all_meta = artifact.properties[_ALL_META_PROPERTY_NAME].string_value
    for k, v in json.loads(all_meta).items():
      if not k in result:
        result[k] = v
    return result

  def _get_context_id(self, reuse_workspace_if_exists):
    ctx = self._get_existing_context()
    if ctx is not None:
      if reuse_workspace_if_exists:
        return ctx.id
      else:
        raise ValueError(
            'Workspace name {} already exists with id {}. You can initialize workspace with reuse_workspace_if_exists=True if want to reuse it'
            .format(self.name, ctx.id))
    # Create new context type or get the existing type id.
    ctx_type = mlpb.ContextType(name=self.CONTEXT_TYPE_NAME,
                                properties={
                                    "description": mlpb.STRING,
                                    "labels": mlpb.STRING
                                })
    ctx_type_id = _retry(lambda: self.store.put_context_type(ctx_type))

    # Add new context for workspace.
    prop = {}
    if self.description is not None:
      prop["description"] = mlpb.Value(string_value=self.description)
    if self.labels is not None:
      prop["labels"] = mlpb.Value(string_value=json.dumps(self.labels))
    ctx = mlpb.Context(
        type_id=ctx_type_id,
        name=self.name,
        properties=prop,
    )
    ctx_id = _retry(lambda: self.store.put_contexts([ctx])[0])
    return ctx_id

  def _get_existing_context(self):
    contexts = _retry(
        lambda: self.store.get_contexts_by_type(self.CONTEXT_TYPE_NAME))
    for ctx in contexts:
      if ctx.name == self.name:
        return ctx
    return None


class Run(object):
  """Run captures a run of pipeline or notebooks in a workspace and group
  executions.
  """

  def __init__(self,
               workspace: Workspace = None,
               name: str = None,
               description: Optional[str] = None):
    """
    Args:
      workspace: Required workspace object to which this run belongs.
      name: Required name of this run.
      description: Optional description.
    """
    if workspace is None:
      raise ValueError("'workspace' must be set.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    self.workspace = workspace
    self.name = name
    self.description = description


class Execution(object):
  """Captures a run of pipeline or notebooks in a workspace and group executions.

  Execution also serves as object for logging artifacts as its input or output.
  """
  EXECUTION_TYPE_NAME = "kubeflow.org/alpha/execution"

  def __init__(self,
               name: str = None,
               workspace: Workspace = None,
               run: Optional[Run] = None,
               description: Optional[str] = None):
    """
    Args:
      name: Required name of this run.
      workspace: Required workspace object where this execution belongs to.
      run: Optional run object.
      description: Optional description.

    Creates a new execution in a workspace and run.
    The execution.log_XXX() methods will attach corresponding artifacts as the
    input or output of this execution.
    """
    if workspace is None:
      raise ValueError("'workspace' must be set.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    self.id = None
    self.name = name
    self.workspace = workspace
    self.run = run
    self.description = description
    self.create_time = _get_rfc3339_time()
    self._type_id = _retry(lambda: self.workspace.store.get_execution_type(
        Execution.EXECUTION_TYPE_NAME).id)
    self.id = _retry(
        lambda: self.workspace.store.put_executions([self.serialized()])[0])
    _retry(lambda: self.workspace.store.put_attributions_and_associations([], [
        mlpb.Association(context_id=self.workspace.context_id,
                         execution_id=self.id)
    ]))

  def __repr__(self):
    field_names = self.__dict__.keys()
    fields_str = ", ".join(
        "{}={!r}".format(name, getattr(self, name)) for name in field_names)
    return "{0.__class__.__module__}.{0.__class__.__qualname__}({1})".format(
        self, fields_str)

  def serialized(self):
    properties = {
        "name": mlpb.Value(string_value=self.name),
        "create_time": mlpb.Value(string_value=self.create_time),
        "description": mlpb.Value(string_value=self.description),
    }
    _del_none_properties(properties)

    custom_properties = {}
    if self.workspace is not None:
      custom_properties[_WORKSPACE_PROPERTY_NAME] = mlpb.Value(
          string_value=self.workspace.name)
    if self.run is not None:
      custom_properties[_RUN_PROPERTY_NAME] = mlpb.Value(
          string_value=self.run.name)
    return mlpb.Execution(type_id=self._type_id,
                          properties=properties,
                          custom_properties=custom_properties)

  def log_input(self, artifact: Artifact) -> Artifact:
    """ Log an artifact as an input of this execution.

    Args:
      artifact: Model, DataSet, Metrics or customized artifact type.

    Returns:
      The same artifact with artifact.id set.
    """
    if artifact is None:
      raise ValueError("'artifact' must be set.")
    self._log(artifact)
    input_event = mlpb.Event(artifact_id=artifact.id,
                             execution_id=self.id,
                             type=mlpb.Event.INPUT)
    _retry(lambda: self.workspace.store.put_events([input_event]))
    return artifact

  def log_output(self, artifact: Artifact) -> Artifact:
    """ Log an artifact as an input of this execution.

    Args:
      artifact: Model, DataSet, Metrics or customized artifact type.

    Returns:
      The same artifact with artifact.id set.
    """
    if artifact is None:
      raise ValueError("'artifact' must be set.")
    self._log(artifact)
    output_event = mlpb.Event(artifact_id=artifact.id,
                              execution_id=self.id,
                              type=mlpb.Event.OUTPUT)
    _retry(lambda: self.workspace.store.put_events([output_event]))
    return artifact

  def _log(self, artifact):
    """Log artifact into metadata store."""
    # Sanity checks for artifact.
    if artifact is None:
      raise ValueError("'artifact' must be set.")
    try:
      type_id = _retry(lambda: self.workspace.store.get_artifact_type(
          artifact.ARTIFACT_TYPE_NAME).id)
    except Exception as e:
      raise ValueError("invalid artifact type %s: exception %s",
                       artifact.ARTIFACT_TYPE_NAME, e)

    # if id is set, then this artifact is already saved in database.
    if artifact.id is not None:
      self._check_artifact_id(artifact.id)
      return artifact

    # Construct a new artifact serialization.
    ser = artifact.serialization()
    ser.type_id = type_id
    if _WORKSPACE_PROPERTY_NAME in ser.custom_properties:
      raise ValueError("custom_properties contains reserved key %s" %
                       _WORKSPACE_PROPERTY_NAME)
    if _RUN_PROPERTY_NAME in ser.custom_properties:
      raise ValueError("custom_properties contains reserved key %s" %
                       _RUN_PROPERTY_NAME)
    if self.workspace is not None:
      ser.custom_properties[
          _WORKSPACE_PROPERTY_NAME].string_value = self.workspace.name
    if self.run is not None:
      ser.custom_properties[_RUN_PROPERTY_NAME].string_value = self.run.name

    # Deduplicate artifact for existing one in the database.
    pbs = _retry(
        lambda: self.workspace.store.get_artifacts_by_uri(artifact.uri))
    for pb in pbs:
      if artifact.is_duplicated(ser, pb):
        artifact.id = pb.id
        return artifact

    artifact.id = _retry(lambda: self.workspace.store.put_artifacts([ser])[0])
    _retry(lambda: self.workspace.store.put_attributions_and_associations([
        mlpb.Attribution(context_id=self.workspace.context_id,
                         artifact_id=artifact.id)
    ], []))
    return artifact

  def _check_artifact_id(self, aid):
    try:
      pbs = _retry(lambda: self.workspace.store.get_artifacts_by_id([aid]))
    except Exception as e:
      raise ValueError("invalid artifact id {}: {}".format(aid, e))
    if len(pbs) != 1:
      raise ValueError(
          "invalid artifact id {}: artifacts with this id: {}".format(aid, pbs))


class DataSet(Artifact):
  """ Dataset captures a data set in a machine learning workflow.

  Attributes:

    uri: Required uri of the data set.
    name: Required name of the data set.
    workspace: Optional name of the workspace.
    description: Optional description of the data set.
    owner: Optional owner of the data set.
    version: Optional version tagged by the user.
    query: Optional query string on how this data set being fetched from a data
      source.
    labels: Optional string key value pairs for labels.

  Example:
      >>> metadata.DataSet(description="an example data",
      ...                  name="mytable-dump",
      ...                  owner="owner@my-company.org",
      ...                  uri="file://path/to/dataset",
      ...                  version="v1.0.0",
      ...                  query="SELECT * FROM mytable",
      ...                  labels={"label1","val1"}))
  """
  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/data_set"

  def __init__(self,
               uri: str = None,
               name: str = None,
               workspace: Optional[str] = None,
               description: Optional[str] = None,
               owner: Optional[str] = None,
               version: Optional[str] = None,
               query: Optional[str] = None,
               labels: Optional[Mapping[str, str]] = None,
               **kwargs):
    """
    Args:
      uri: Required uri of the data set.
      name: Required name of the data set.
      workspace: Optional name of the workspace.
      description: Optional description of the data set.
      owner: Optional owner of the data set.
      version: Optional version tagged by the user.
      query: Optional query string on how this data set being fetched from
        a data source.
      labels: Optional string key value pairs for labels.
      kwargs: Optional additional keyword arguments are saved as additional
        properties of this dataset.
    """
    if uri is None or type(uri) != str:
      raise ValueError("'uri' must be set and in string type.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.version = version
    self.query = query
    self.labels = labels
    self.id = None
    self.create_time = _get_rfc3339_time()
    self.kwargs = kwargs

  def __repr__(self):
    field_names = self.__dict__.keys()
    fields_str = ", ".join(
        "{}={!r}".format(name, getattr(self, name)) for name in field_names)
    return "{0.__class__.__module__}.{0.__class__.__qualname__}({1})".format(
        self, fields_str)

  def serialization(self):
    data_set_artifact = mlpb.Artifact(
        uri=self.uri,
        properties={
            "name":
                mlpb.Value(string_value=self.name),
            "create_time":
                mlpb.Value(string_value=self.create_time),
            "description":
                mlpb.Value(string_value=self.description),
            "query":
                mlpb.Value(string_value=self.query),
            "version":
                mlpb.Value(string_value=self.version),
            "owner":
                mlpb.Value(string_value=self.owner),
            _ALL_META_PROPERTY_NAME:
                mlpb.Value(string_value=json.dumps(self.__dict__)),
        })
    _del_none_properties(data_set_artifact.properties)
    return data_set_artifact

  @staticmethod
  def is_duplicated(a, b):
    ap = a.properties
    bp = b.properties
    aws = a.custom_properties.get(_WORKSPACE_PROPERTY_NAME)
    bws = b.custom_properties.get(_WORKSPACE_PROPERTY_NAME)
    return a.type_id == b.type_id and a.uri == b.uri and ap.get(
        "name") == bp.get("name") and ap.get("version") == bp.get(
            "version") and aws == bws


class Model(Artifact):
  """Captures a machine learning model.

  Attributes:
      uri: Required uri of the model artifact, e.g. "gcs://path/to/model.h5".
      name: Required name of the model.
      workspace: Optional name of the workspace.
      description: Optional description of the model.
      owner: Optional owner of the model.
      model_type: Optional type of the model.
      training_framework: Optional framework used to train the model.
      hyperparameters: Optional map from hyper param name to its value.
      labels: Optional string key value pairs for labels.
      kwargs: Optional additional keyword arguments are saved as additional
        properties of this model.

  Example:
      >>> metadata.Model(name="MNIST",
      ...                description="model to recognize handwritten digits",
      ...                owner="someone@kubeflow.org",
      ...                uri="gcs://my-bucket/mnist",
      ...                model_type="neural network",
      ...                training_framework={
      ...                   "name": "tensorflow",
      ...                   "version": "v1.0"
      ...                },
      ...                hyperparameters={
      ...                   "learning_rate": 0.5,
      ...                   "layers": [10, 3, 1],
      ...                   "early_stop": True
      ...                },
      ...                version="v0.0.1",
      ...                labels={"mylabel": "l1"}))
  """

  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/model"

  def __init__(self,
               uri: str = None,
               name: str = None,
               workspace: Optional[str] = None,
               description: Optional[str] = None,
               owner: Optional[str] = None,
               version: Optional[str] = None,
               model_type: Optional[str] = None,
               training_framework: Optional[Any] = None,
               hyperparameters: Optional[Mapping[str, float]] = None,
               labels: Optional[Mapping[str, str]] = None,
               **kwargs):
    """
    Args:
      uri: Required uri of the metrics.
      name: Required name of the metrics.
      workspace: Optional name of the workspace.
      description: Optional description of the metrics.
      owner: Optional owner of the metrics.
      model_type: Optional type of the model.
      training_framework: Optional framework used to train the model.
      hyperparameters: Optional map from hyper param name to its value.
      labels: Optional string key value pairs for labels.
      kwargs: Optional additional keyword arguments are saved as additional
        properties of this model.
    """
    if uri is None or type(uri) != str:
      raise ValueError("'uri' must be set and in string type.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.version = version
    self.model_type = model_type
    self.training_framework = training_framework
    self.hyperparameters = hyperparameters
    self.labels = labels
    self.id = None
    self.create_time = _get_rfc3339_time()
    self.kwargs = kwargs

  def __repr__(self):
    field_names = self.__dict__.keys()
    fields_str = ", ".join(
        "{}={!r}".format(name, getattr(self, name)) for name in field_names)
    return "{0.__class__.__module__}.{0.__class__.__qualname__}({1})".format(
        self, fields_str)

  def serialization(self):
    model_artifact = mlpb.Artifact(
        uri=self.uri,
        properties={
            "name":
                mlpb.Value(string_value=self.name),
            "create_time":
                mlpb.Value(string_value=self.create_time),
            "description":
                mlpb.Value(string_value=self.description),
            "model_type":
                mlpb.Value(string_value=self.model_type),
            "version":
                mlpb.Value(string_value=self.version),
            "owner":
                mlpb.Value(string_value=self.owner),
            _ALL_META_PROPERTY_NAME:
                mlpb.Value(string_value=json.dumps(self.__dict__)),
        })
    _del_none_properties(model_artifact.properties)
    return model_artifact

  @staticmethod
  def is_duplicated(a, b):
    ap = a.properties
    bp = b.properties
    aws = a.custom_properties.get(_WORKSPACE_PROPERTY_NAME)
    bws = b.custom_properties.get(_WORKSPACE_PROPERTY_NAME)
    return a.type_id == b.type_id and a.uri == b.uri and ap.get(
        "name") == bp.get("name") and ap.get("version") == bp.get(
            "version") and aws == bws


class Metrics(Artifact):
  """Captures an evaluation metrics of a model on a data set.

  Attributes:
    uri: Required uri of the metrics.
    name: Required name of the metrics.
    workspace: Optional name of the workspace.
    description: Optional description of the metrics.
    owner: Optional owner of the metrics.
    data_set_id: Optional id of the data set used for evaluation.
    model_id: Optional id of a evaluated model.
    metrics_type: Optional type of the evaluation.
    values: Optional map from metrics name to its value.
    labels: Optional string key value pairs for labels.

  Example:
    >>> metadata.Metrics(
    ...        name="MNIST-evaluation",
    ...        description=
    ...        "validating the MNIST model to recognize handwritten digits",
    ...        owner="someone@kubeflow.org",
    ...        uri="gcs://my-bucket/mnist-eval.csv",
    ...        data_set_id="123",
    ...        model_id="12345",
    ...        metrics_type=metadata.Metrics.VALIDATION,
    ...        values={"accuracy": 0.95},
    ...        labels={"mylabel": "l1"}))
  """

  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/metrics"

  # Possible evaluation metrics types.
  TRAINING = "training"
  VALIDATION = "validation"
  TESTING = "testing"
  PRODUCTION = "production"

  def __init__(self,
               uri: str = None,
               name: str = None,
               workspace: Optional[str] = None,
               description: Optional[str] = None,
               owner: Optional[str] = None,
               data_set_id: Optional[str] = None,
               model_id: Optional[str] = None,
               metrics_type: Optional[str] = None,
               values: Optional[Mapping[str, float]] = None,
               labels: Optional[Mapping[str, str]] = None,
               **kwargs):
    """
    Args:
      uri: Required uri of the metrics.
      name: Required name of the metrics.
      workspace: Optional name of the workspace.
      description: Optional description of the metrics.
      owner: Optional owner of the metrics.
      data_set_id: Optional id of the data set used for evaluation.
      model_id: Optional id of a evaluated model.
      metrics_type: Optional type of the evaluation.
      values: Optional map from metrics name to its value.
      labels: Optional string key value pairs for labels.
      kwargs: additional keyword arguments are saved as additional properties
        of this metrics.
    """
    if uri is None or type(uri) != str:
      raise ValueError("'uri' must be set and in string type.")
    if name is None or type(name) != str:
      raise ValueError("'name' must be set and in string type.")
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.data_set_id = data_set_id
    self.model_id = model_id
    self.metrics_type = metrics_type
    self.values = values
    self.labels = labels
    self.id = None
    self.create_time = _get_rfc3339_time()
    self.kwargs = kwargs

  def __repr__(self):
    field_names = self.__dict__.keys()
    fields_str = ", ".join(
        "{}={!r}".format(name, getattr(self, name)) for name in field_names)
    return "{0.__class__.__module__}.{0.__class__.__qualname__}({1})".format(
        self, fields_str)

  def serialization(self):
    metrics_artifact = mlpb.Artifact(
        uri=self.uri,
        properties={
            "name":
                mlpb.Value(string_value=self.name),
            "create_time":
                mlpb.Value(string_value=self.create_time),
            "description":
                mlpb.Value(string_value=self.description),
            "metrics_type":
                mlpb.Value(string_value=self.metrics_type),
            "data_set_id":
                mlpb.Value(string_value=self.data_set_id),
            "model_id":
                mlpb.Value(string_value=self.model_id),
            "owner":
                mlpb.Value(string_value=self.owner),
            _ALL_META_PROPERTY_NAME:
                mlpb.Value(string_value=json.dumps(self.__dict__)),
        })
    _del_none_properties(metrics_artifact.properties)
    return metrics_artifact


@retry(wait_exponential_multiplier=500, stop_max_delay=4000)
def _retry(f):
  '''retry function f with exponential backoff'''
  return f()


def _get_rfc3339_time():
  return datetime.datetime.utcnow().isoformat("T") + "Z"


def _del_none_properties(dict):
  keys = list(dict.keys())
  for k in keys:
    if not any((dict[k].string_value, dict[k].int_value, dict[k].double_value)):
      del dict[k]
