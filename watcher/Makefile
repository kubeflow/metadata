build:
	go build -o main/main main/main.go

test: build
	./main/main -kubeconfig=${HOME}/.kube/config -metadata_service=http://0.0.0.0:8080 -resourcelist=dockerfiles/resource_list_testing.json

docker-image:
	cd .. && \
	docker build -t gcr.io/kubeflow-images-public/metadata/watcher -f watcher/dockerfiles/Dockerfile .

deploy:
	kubectl apply -f dockerfiles/role.yaml && \
	kubectl apply -f dockerfiles/rolebinding.yaml && \
	kubectl apply -f dockerfiles/watcher.yaml -n kubeflow
