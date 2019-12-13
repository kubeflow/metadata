import tempfile
import logging
import os
import papermill

logger = logging.getLogger(__name__)

FILE_DIR = os.path.dirname(__file__)
NOTEBOOK_REL_PATH = "../sample/demo.ipynb"
NOTEBOOK_ABS_PATH = os.path.normpath(os.path.join(FILE_DIR, NOTEBOOK_REL_PATH))

GRPC_HOST = "127.0.0.1"
GRPC_PORT = 8081

def test_notebook():
  temp_dir = tempfile.mkdtemp()
  notebook_output_path = os.path.join(temp_dir, "out.ipynb")
  parameters = {
    "METADATA_STORE_HOST": GRPC_HOST,
    "METADATA_STORE_PORT": GRPC_PORT,
  }
  papermill.execute_notebook(NOTEBOOK_ABS_PATH, notebook_output_path,
                             cwd=os.path.dirname(NOTEBOOK_ABS_PATH),
                             parameters=parameters,
                             log_output=True)
  check_notebook_output(notebook_output_path)

def check_notebook_output(output_path):
  num_cells = 0
  num_completed_cells = 0
  with open(output_path, 'r') as f:
    for lines in f:
      if lines.find('"status:": "completed"') != -1:
        num_completed_cells = num_completed_cells + 1
      if lines.find('cell_type') != -1:
        num_cells = num_cells + 1
    assert num_cells == num_completed_cells, "Not all cells succeeded. Notebook output:\n {}".format(f.read())

