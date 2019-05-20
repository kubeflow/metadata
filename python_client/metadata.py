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
               annotations=None):
    """
    Args:
      backend_url_prefix {str} -- Required URL prefix pointing to the metadata
                                  backend, e.g. "127.0.0.1:8080".
      name {str} -- Required name for the workspace.
      description {str} -- Optional string for description of the workspace.
      label {object} Optional key/value string pairs to label the workspace.
    """
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.backend_url_prefix = backend_url_prefix
    self.name = name
    self.description = description
    self.annotations = annotations
    self._user = ""
    self._id = ""

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

  def log_data_set(self, data_set):
    """
    Log a DataSet as an input of this run to metadata backend serivce.
    """
    # TODO(zhenghuiwang): dedup the data set based the uri and version set by
    # the user: Retrieve the id of previous insertion instead of create it
    # again.
    pass

  def log_metrics(self, metrics):
    """
    Log a metrics as an output of this run to metadata backend serivce.
    """
    pass

  def log_model(self, model):
    """
    Log a model as an output of this run to metadata backend serivce.
    """
    pass

class DataSet(object):
  """
  Captures a data set in a machine learning workflow.
  """

  def __init__(self,
               workspace=None,
               name=None,
               description=None,
               owner=None,
               uri=None,
               version=None,
               query=None,
               annotations=None):
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
      annotations {object} -- Optional string key value pairs for annotations.
    """
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.version = version
    self.query = query
    self.annotations = annotations
    self._id = ""
    self._create_time = ""

class Model(object):
  """
  Captures a machine learning model.
  """

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
               query=None,
               annotations=None):
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
      annotations {object} -- Optional string key value pairs for annotations.
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
    self.query = query
    self.annotations = annotations
    self._id = ""
    self._create_time = ""


class Metrics(object):
  """Captures an evaulation metrics of a model on a data set."""
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
               annotations=None):
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
      annotations {object} -- Optional string key value pairs for annotations.
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
    self.annotations = annotations
    self._id = ""
    self._create_time = ""
