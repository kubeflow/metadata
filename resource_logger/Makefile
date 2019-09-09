build:
	go build -o main/main main/main.go

test: build
	./main/main -kubeconfig=${HOME}/.kube/config -metadata_service=http://0.0.0.0:8080 -resourcelist=Dockerfile/resource_list_testing.json
