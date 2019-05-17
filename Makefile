TAG ?= master

build:
	go build ./...

.PHONY: test
test:
	bash test/scripts/unittests.sh

.PHONY: mocks
mocks:
	mockgen -package=mocks -destination=mocks/metadata_store_service_client_mock.go github.com/kubeflow/metadata/ml_metadata MetadataStoreServiceClient

hello:
	curl localhost:8080/api/v1/resource/my-resource

# TODO: use bazel to compile the protos instead of local protoc.
mlmd-proto:
	rm -rf /tmp/ml-metadata && \
	git clone --branch $(TAG) https://github.com/google/ml-metadata.git /tmp/ml-metadata && \
	rm -rf ml_metadata/proto && \
	mkdir ml_metadata/proto && \
	cp /tmp/ml-metadata/ml_metadata/proto/*.proto ml_metadata/proto && \
	protoc -I . ml_metadata/proto/*.proto --go_out=plugins=grpc:. && \
	mv ml_metadata/proto/*.go ml_metadata/

mlmd-docker-image:
	docker build -t gcr.io/kubeflow-images-public/ml-metadata -f ml_metadata/Dockerfile .

metadata-docker-image:
	docker build -t gcr.io/kubeflow-images-public/metadata .
