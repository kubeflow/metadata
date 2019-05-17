class Model:
  """
  Capturesa machine learning model.

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

  def __init__(self,
               workspace= None,
               name = None,
               description = None,
               owner = None,
               uri = None,
               version = None,
               model_type = None,
               training_framework = None,
               hyperparameters = None,
               query = None,
               annotations = None):
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
    self.annotations = annotations
    self._id = ""
    self._create_time = ""
