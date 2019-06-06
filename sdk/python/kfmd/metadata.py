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

import json
import swagger_client
from swagger_client import Configuration, ApiClient, MetadataServiceApi

"""
This module conatins Python API for logging metadata of machine learning
workflows to Kubeflow Metadata service.
"""

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
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.backend_url_prefix = backend_url_prefix
    self.name = name
    self.description = description
    self.labels = labels

    config = Configuration()
    config.host = backend_url_prefix
    self._client = MetadataServiceApi(ApiClient(config))

class Run(object):
  """
  Captures a run of pipeline or notebooks in a workspace and provides logging
  methods for artifacts.
  """

  def __init__(self, workspace=None, name=None, description=None):
    """
    Args:
      workspace {Worspace} -- Requried workspace object.
      name {str} -- Requried name of this run.
      description {str} -- Optional description.

    Creates a new run in a workspace and an execution for this run.
    The run.log_XXX() methods will attach corresponding artifacts as the
    input or output of this execution.

    Returns a run object for logging.
    """
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.workspace = workspace
    self.name = name
    self.description = description

  def log(self, artifact):
    """
    Log an artifact as an input or output of this run to
    metadata backend serivce.

    This method expects `artifact` to have
      - ARTIFACT_TYPE_NAME stirng field the form of
        /artifact_types/<namespace>/<name>.
      - serialization() method to return a swagger_client.ApiArtifact.

    This method will set artifact._id and artifact._create_time.
    """

    # TODO(zhenghui): log this artifact as the input or output of an execution.
    serialization = artifact.serialization()
    if serialization.workspace.name == None:
      serialization.workspace.name = self.workspace.name
    response = self.workspace._client.create_artifact(
      parent=artifact.ARTIFACT_TYPE_NAME,
      body=serialization,
    )
    artifact._id = response.artifact.id
    artifact._create_time = response.artifact.create_time
    return response

class DataSet(object):
  """
  Captures a data set in a machine learning workflow.
  """
  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/data_set"

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
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.version = version
    self.query = query
    self.labels = labels
    self._id = ""
    self._create_time = ""

  def serialization(self):
    data_set_artifact = swagger_client.ApiArtifact(
        workspace=swagger_client.ApiWorkspace(name=self.workspace),
        uri=self.uri,
        name=self.name,
        properties={
            "description":
                swagger_client.ApiValue(string_value=self.description),
            "query":
                swagger_client.ApiValue(string_value=self.query),
            "version":
                swagger_client.ApiValue(string_value=self.version),
            "owner":
                swagger_client.ApiValue(string_value=self.owner),
            "__ALL_META__":
                swagger_client.ApiValue(string_value=json.dumps(self.json())),
        })
    return data_set_artifact

  def json(self):
    return {
      "id": self._id,
      "name": self.name,
      "description": self.description,
      "owner": self.owner,
      "uri": self.uri,
      "version": self.version,
      "query": self.query,
    }

class Model(object):
  """
  Captures a machine learning model.
  """

  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/model"

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
    # TODO(zhenghuiwang): check each field's type and whether set.
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
    self._id = ""
    self._create_time = ""

  def serialization(self):
    model_artifact = swagger_client.ApiArtifact(
        workspace=swagger_client.ApiWorkspace(name=self.workspace),
        uri=self.uri,
        name=self.name,
        properties={
            "description":
                swagger_client.ApiValue(string_value=self.description),
            "model_type":
                swagger_client.ApiValue(string_value=self.model_type),
            "version":
                swagger_client.ApiValue(string_value=self.version),
            "owner":
                swagger_client.ApiValue(string_value=self.owner),
            "__ALL_META__":
                swagger_client.ApiValue(string_value=json.dumps(self.json())),
        })
    return model_artifact

  def json(self):
    return {
      "id": self._id,
      "name": self.name,
      "description": self.description,
      "owner": self.owner,
      "uri": self.uri,
      "version": self.version,
      "model_type": self.model_type,
      "hyperparameters": self.hyperparameters,
      "training_framework": self.training_framework,
    }


class Metrics(object):
  """Captures an evaulation metrics of a model on a data set."""

  ARTIFACT_TYPE_NAME = "artifact_types/kubeflow.org/alpha/metrics"

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
    # TODO(zhenghuiwang): check each field's type and whether it is set.
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
    self._id = ""
    self._create_time = ""

  def serialization(self):
    model_artifact = swagger_client.ApiArtifact(
        workspace=swagger_client.ApiWorkspace(name=self.workspace),
        uri=self.uri,
        name=self.name,
        properties={
            "description":
                swagger_client.ApiValue(string_value=self.description),
            "metrics_type":
                swagger_client.ApiValue(string_value=self.metrics_type),
            "data_set_id":
                swagger_client.ApiValue(string_value=self.data_set_id),
            "model_id":
                swagger_client.ApiValue(string_value=self.model_id),
            "owner":
                swagger_client.ApiValue(string_value=self.owner),
            "__ALL_META__":
                swagger_client.ApiValue(string_value=json.dumps(self.json())),
        })
    return model_artifact

  def json(self):
    return {
      "id": self._id,
      "name": self.name,
      "description": self.description,
      "owner": self.owner,
      "uri": self.uri,
      "metrics_type": self.metrics_type,
      "data_set_id": self.data_set_id,
      "model_id": self.model_id,
      "values": self.values,
    }

