# Copyright 2018 Google LLC
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
from kfmd import openapi_client
from kfmd.openapi_client import Configuration, ApiClient, MetadataServiceApi

"""
This module contains the Python API for logging metadata of machine learning
workflows to the Kubeflow Metadata service.
"""

WORKSPACE_PROPERTY_NAME = '__kf_workspace__'
RUN_PROPERTY_NAME = '__kf_run__'
ALL_META_PROPERTY_NAME = '__ALL_META__'

class Workspace(object):
  """
  Groups a set of runs of pipelines, notebooks and their related artifacts
  and executions.
  """

  def __init__(self,
               backend_url_prefix=None,
               name=None,
               description=None,
               labels=None):
    """
    Args:
      backend_url_prefix {str} -- Required URL prefix pointing to the metadata
                                  backend, e.g. "127.0.0.1:8080".
      name {str} -- Required name for the workspace.
      description {str} -- Optional string for description of the workspace.
      labels {object} Optional key/value string pairs to label the workspace.
    """
    if backend_url_prefix is None or type(backend_url_prefix) != str:
          raise ValueError("'backend_url_prefix' must be set and in string type.")
    if name is None or type(name) != str:
          raise ValueError("'name' must be set and in string type.")
    self.backend_url_prefix = backend_url_prefix
    self.name = name
    self.description = description
    self.labels = labels

    config = Configuration()
    config.host = backend_url_prefix
    self.client = MetadataServiceApi(ApiClient(config))

  def list(self, artifact_type_name=None):
    """
    Args:
      artifact_type_name {str} name of artifact type.
    Returns a list of artifacts of the provided typed associated
    with this workspace. Each artifact is represented as a dict.
    """
    if artifact_type_name is None:
      artifact_type_name = Model.ARTIFACT_TYPE_NAME
    response = self.client.list_artifacts(artifact_type_name)
    results = []
    if not response.artifacts:
      return results
    for artifact in response.artifacts:
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
        if WORKSPACE_PROPERTY_NAME in artifact.custom_properties:
          result["workspace"] = artifact.custom_properties[WORKSPACE_PROPERTY_NAME].string_value
        if RUN_PROPERTY_NAME in artifact.custom_properties:
          result["run"] = artifact.custom_properties[RUN_PROPERTY_NAME].string_value
    if not artifact.properties:
      return result
    for k,v in artifact.properties.items():
      if k != ALL_META_PROPERTY_NAME:
        if v.string_value is not None:
          result[k] = v.string_value
        elif v.int_value is not None:
          result[k] = v.int_value
        else:
          result[k] = v.double_value
    if not ALL_META_PROPERTY_NAME in artifact.properties:
      return result
    # Pick up all nested objects stored in the __ALL_META__ field.
    all_meta = artifact.properties[ALL_META_PROPERTY_NAME].string_value
    for k, v in json.loads(all_meta).items():
      if not k in result:
        result[k] = v
    return result

class Run(object):
  """
  Captures a run of pipeline or notebooks in a workspace and group executions.
  """

  def __init__(self, workspace=None, name=None, description=None):
    """
    Args:
      workspace {Worspace} -- Required workspace object.
      name {str} -- Required name of this run.
      description {str} -- Optional description.
    """
    if workspace is None:
          raise ValueError("'workspace' must be set.")
    if name is None or type(name) != str:
          raise ValueError("'name' must be set and in string type.")
    self.workspace = workspace
    self.name = name
    self.description = description

class Execution(object):
  """
  Captures a run of pipeline or notebooks in a workspace and group executions.
  """
  EXECUTION_TYPE_NAME = "kubeflow.org/alpha/execution"

  def __init__(self, name=None, workspace=None, run=None, description=None):
    """
    Args:
      name {str} -- Required name of this run.
      workspace {Worspace} -- required workspace object.
      run {Run} -- optional run object.
      description {str} -- Optional description.

    Creates a new execution in a workspace and run.
    The exection.log_XXX() methods will attach corresponding artifacts as the
    input or output of this execution.

    Returns an execution object for logging.
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
    self.create_time = get_rfc3339_time()
    response = self.workspace.client.create_execution(
        parent=self.EXECUTION_TYPE_NAME,
        body=self.serialized(),
    )
    self.id = response.execution.id

  def serialized(self):
    execution = openapi_client.MlMetadataExecution(
    properties={
        "name":
            openapi_client.MlMetadataValue(string_value=self.name),
        "create_time":
            openapi_client.MlMetadataValue(string_value=self.create_time),
        "description":
            _mlMetadataStringValue(self.description),
    })
    _del_none_properties(execution.properties)

    execution.custom_properties = {}
    if self.workspace is not None:
      execution.custom_properties[
          WORKSPACE_PROPERTY_NAME] = openapi_client.MlMetadataValue(
          string_value=self.workspace.name)
    if self.run is not None:
      execution.custom_properties[
          RUN_PROPERTY_NAME] = openapi_client.MlMetadataValue(
          string_value=self.run.name)
    return execution

  def log_input(self, artifact):
    """
    Log an artifact as an input of this execution.

    This method expects `artifact` to have
      - ARTIFACT_TYPE_NAME string field the form of
        <namespace>/<name>.
      - serialization() method to return a openapi_client.MlMetadataArtifact.

    This method will set artifact.id.
    """
    if artifact is None:
          raise ValueError("'artifact' must be set.")
    self._log(artifact)
    input_event = openapi_client.MlMetadataEvent(
      artifact_id=artifact.id,
      execution_id=self.id,
      type=openapi_client.MlMetadataEventType.INPUT
    )
    self.workspace.client.create_event(input_event)
    return artifact

  def log_output(self, artifact):
    """
    Log an artifact as an output of this execution.

    This method expects `artifact` to have
      - ARTIFACT_TYPE_NAME string field the form of
        <namespace>/<name>.
      - serialization() method to return a openapi_client.MlMetadataArtifact.

    This method will set artifact.id.
    """
    if artifact is None:
          raise ValueError("'artifact' must be set.")
    self._log(artifact)
    output_event = openapi_client.MlMetadataEvent(
      artifact_id=artifact.id,
      execution_id=self.id,
      type=openapi_client.MlMetadataEventType.OUTPUT
    )
    self.workspace.client.create_event(output_event)
    return artifact


  def _log(self, artifact):
    """
    Log an artifact.

    This method expects `artifact` to have
      - ARTIFACT_TYPE_NAME string field the form of
        <namespace>/<name>.
      - serialization() method to return a openapi_client.MlMetadataArtifact.

    This method will set artifact.id.
    """
    if artifact is None:
          raise ValueError("'artifact' must be set.")
    serialization = artifact.serialization()
    if serialization.custom_properties is None:
          serialization.custom_properties = {}
    if WORKSPACE_PROPERTY_NAME in serialization.custom_properties:
          raise ValueError("custom_properties contains reserved key %s"
                           % WORKSPACE_PROPERTY_NAME)
    if RUN_PROPERTY_NAME in serialization.custom_properties:
      raise ValueError("custom_properties contains reserved key %s"
                       % RUN_PROPERTY_NAME)
    if self.workspace is not None:
      serialization.custom_properties[
          WORKSPACE_PROPERTY_NAME] = openapi_client.MlMetadataValue(
          string_value=self.workspace.name)
    if self.run is not None:
      serialization.custom_properties[
          RUN_PROPERTY_NAME] = openapi_client.MlMetadataValue(
          string_value=self.run.name)
    response = self.workspace.client.create_artifact(
        parent=artifact.ARTIFACT_TYPE_NAME,
        body=serialization,
    )
    artifact.id = response.artifact.id
    return artifact

class DataSet(object):
  """
  Captures a data set in a machine learning workflow.
  """
  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/data_set"

  def __init__(self,
               workspace=None,
               name=None,
               description=None,
               owner=None,
               uri=None,
               version=None,
               query=None,
               labels=None,
               **kwargs):
    """
    Args:
      workspace {str} -- Optional name of the workspace.
      name {str} -- Required name of the data set.
      description {str} -- Optional description of the data set.
      owner {str} -- Optional owner of the data set.
      uri {str} -- Required uri of the data set.
      version {str} -- Optional version tagged by the user.
      query {str} -- Optioan query string for how to fetch this data set from
                      a data source.
      labels {object} -- Optional string key value pairs for labels.
    Addtional keyword arguments are saved as addtional properties of this
    dataset.
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
    self.create_time = get_rfc3339_time()

  def serialization(self):
    data_set_artifact = openapi_client.MlMetadataArtifact(
        uri=self.uri,
        properties={
            "name":
                openapi_client.MlMetadataValue(string_value=self.name),
            "create_time":
                openapi_client.MlMetadataValue(string_value=self.create_time),
            "description":
                _mlMetadataStringValue(self.description),
            "query":
                _mlMetadataStringValue(self.query),
            "version":
                _mlMetadataStringValue(self.version),
            "owner":
                _mlMetadataStringValue(self.owner),
            ALL_META_PROPERTY_NAME:
                _mlMetadataStringValue(json.dumps(self.__dict__)),
        })
    _del_none_properties(data_set_artifact.properties)
    return data_set_artifact

class Model(object):
  """
  Captures a machine learning model.
  """

  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/model"

  def __init__(self,
               workspace=None,
               name=None,
               description=None,
               owner=None,
               uri=None,
               version=None,
               model_type=None,
               training_framework=None,
               hyperparameters=None,
               labels=None,
               **kwargs):
    """
    Args:
      workspace {str} -- Optional name of the workspace.
      name {str} -- Required name of the metrics.
      description {str} -- Optional description of the metrics.
      owner {str} -- Optional owner of the metrics.
      uri {str} -- Required uri of the metrics.
      model_type {str} -- Optional type of the model.
      training_framework {object} -- Optional framework used to train the model.
      hyperparameters {object}-- Optional map from hyper param name to its value.
      labels {object} -- Optional string key value pairs for labels.
    Addtional keyword arguments are saved as addtional properties of this model.
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
    self.create_time = get_rfc3339_time()

  def serialization(self):
    model_artifact = openapi_client.MlMetadataArtifact(
        uri=self.uri,
        properties={
            "name":
                openapi_client.MlMetadataValue(string_value=self.name),
            "create_time":
                openapi_client.MlMetadataValue(string_value=self.create_time),
            "description":
                _mlMetadataStringValue(self.description),
            "model_type":
                _mlMetadataStringValue(self.model_type),
            "version":
                _mlMetadataStringValue(self.version),
            "owner":
                _mlMetadataStringValue(self.owner),
            ALL_META_PROPERTY_NAME:
                _mlMetadataStringValue(json.dumps(self.__dict__)),
        })
    _del_none_properties(model_artifact.properties)
    return model_artifact


class Metrics(object):
  """Captures an evaulation metrics of a model on a data set."""

  ARTIFACT_TYPE_NAME = "kubeflow.org/alpha/metrics"

  # Possible evaluation metrics types.
  TRAINING = "training"
  VALIDATION = "validation"
  TESTING = "testing"
  PRODUCTION = "production"

  def __init__(self,
               workspace=None,
               name=None,
               description=None,
               owner=None,
               uri=None,
               data_set_id=None,
               model_id=None,
               metrics_type=None,
               values=None,
               labels=None,
               **kwargs):
    """
    Args:
      workspace {str} -- Optional name of the workspace.
      name {str} -- Required name of the metrics.
      description {str} -- Optional description of the metrics.
      owner {str} -- Optional owner of the metrics.
      uri {str} -- Required uri of the metrics.
      data_set_id {str} -- Optional id of the data set used for evaluation.
      model_id {str} -- Optional id of a evluated model.
      metrics_type {str}-- Optional type of the evaluation.
      values {object} -- Optional map from metrics name to its value.
      labels {object} -- Optional string key value pairs for labels.
    Addtional keyword arguments are saved as addtional properties of this
    metrics.
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
    self.create_time = get_rfc3339_time()

  def serialization(self):
    metrics_artifact = openapi_client.MlMetadataArtifact(
        uri=self.uri,
        properties={
            "name":
                openapi_client.MlMetadataValue(string_value=self.name),
            "create_time":
                openapi_client.MlMetadataValue(string_value=self.create_time),
            "description":
                _mlMetadataStringValue(self.description),
            "metrics_type":
                _mlMetadataStringValue(self.metrics_type),
            "data_set_id":
                _mlMetadataStringValue(self.data_set_id),
            "model_id":
                _mlMetadataStringValue(self.model_id),
            "owner":
                _mlMetadataStringValue(self.owner),
            ALL_META_PROPERTY_NAME:
                _mlMetadataStringValue(json.dumps(self.__dict__)),
        })
    _del_none_properties(metrics_artifact.properties)
    return metrics_artifact

def get_rfc3339_time():
      return datetime.datetime.utcnow().isoformat("T") + "Z"

def _mlMetadataStringValue(str):
      if str is None:
            return None
      return openapi_client.MlMetadataValue(string_value=str)

def _del_none_properties(dict):
      keys = [k for k in dict.keys()]
      for k in keys:
            if dict[k] is None:
                  del(dict[k])
