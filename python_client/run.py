class Run:
  """
  Captures a run of pipeline or notebooks in a workspace and provides logging
  methods for artifacts.

  Args:

  """
  def __init__(self,
               workspace = None,
               name = None,
               description = None):
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.workspace = workspace
    self.name = name
    self.description = description

  def log_data_set(self, data_set):
    pass

  def log_metrics(self, metrics):
    pass

  def log_model(self, model):
    pass
