class DataSet:
  """
  Captures a data set in a machine learning workflow.

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

  def __init__(self,
               workspace= None,
               name = None,
               description = None,
               owner = None,
               uri = None,
               version = None,
               query = None,
               annotations = None):
    # TODO(zhenghuiwang): check each field's type and whether set.
    self.workspace = workspace
    self.name = name
    self.description = description
    self.owner = owner
    self.uri = uri
    self.version = version
    self.query = query
    self.annotations = annotations
