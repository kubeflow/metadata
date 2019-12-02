test:
	pytest ./tests/*test.py

test-cov:
	pytest --cov-report=html:/tmp/cov_html --cov=kubeflow/metadata ./tests/*test.py

lint:
	python -m yapf --style '{based_on_style: google, indent_width: 2}' -i ./tests/*.py ./kubeflow/metadata/*.py
