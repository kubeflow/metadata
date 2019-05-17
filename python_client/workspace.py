import run

class Workspace:
  """
  Groups a set of runs of pipelines, notebooks and their related artifacts
  and executions.

  Args:
    backend_url_prefix {str} -- Required URL prefix pointing to the metadata
                                backend, e.g. "127.0.0.1:8080".
    name {str} -- Required name for the workspace.
    description {str} -- Optional string for description of the workspace.
    label {object} Optional key/value string pairs to label the workspace.
  """
  def __init__(self,
               backend_url_prefix = None,
               name = None,
               description = None,
               annotations = None):
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.backend_url_prefix = backend_url_prefix
    self.name = name
    self.description = description
    self.annotations = annotations
    self._user = ""
    self._id = ""

