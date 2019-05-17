import dataset
import model
import metrics
import workspace

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
    # TODO(zhenghuiwang): dedup the data set based the uri and version set by
    # the user: Retrieve the id of previous insertion instead of create it
    # again.
    if data_set.workspace == None:
      data_set.workspace = self.workspace.name

    pass

  def log_metrics(self, metrics):
    pass

  def log_model(self, model):
    pass
