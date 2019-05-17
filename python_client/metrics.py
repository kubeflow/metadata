class Metrics:
  TRAINING = "training"
  VALIDATION = "validation"
  TESTING = "testing"
  PRODUCTION = "production"
  """
  Captures model evaluation metrics in a machine learning workflow.

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

  def __init__(self,
               workspace= None,
               name = None,
               description = None,
               owner = None,
               uri = None,
               data_set_id = None,
               model_id = None,
               metrics_type = None,
               values = None,
               annotations = None):
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
