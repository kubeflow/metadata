TAG ?= master

build:
	bazel build -c opt --define=grpc_no_ares=true //...
run:
	bazel run --define=grpc_no_ares=true //server -- --logtostderr --mysql_service_port=3306 --mysql_service_user=root --mlmd_db_name=metadb --mysql_service_password=%password%
.PHONY: test
test:
	bazel test -c opt --define=grpc_no_ares=true //...

.PHONY: unittest
unittest:
	bash test/scripts/unittests.sh

update:
	bazel run //:gazelle -- update-repos -from_file=go.mod

# TODO: use bazel to compile the protos instead of local protoc.
mlmd-proto:
	rm -rf /tmp/ml-metadata && \
	git clone --branch $(TAG) https://github.com/google/ml-metadata.git /tmp/ml-metadata && \
	rm -rf ml_metadata/proto && \
	mkdir -p ml_metadata/proto && \
	cp /tmp/ml-metadata/ml_metadata/proto/*.proto ml_metadata/proto && \
	protoc -I . ml_metadata/proto/*.proto --go_out=plugins=grpc:. && \
	mv ml_metadata/proto/*.go ml_metadata/

metadata-docker-image:
	@if test $(shell uname -m) = "aarch64"; then \
		docker build -t metadata-base-aarch64:latest -f ./dockerfiles/Dockerfile-linux-base.aarch64 . && \
		docker build -t gcr.io/kubeflow-images-public/metadata --build-arg BASE_IMG=metadata-base-aarch64:latest --build-arg OUTPUT_DIR=linux_arm64_stripped .;\
	else \
		docker build -t gcr.io/kubeflow-images-public/metadata .;\
	fi

swagger-py-client:
	mkdir -p /tmp/swagger
	wget http://central.maven.org/maven2/org/openapitools/openapi-generator-cli/4.0.1/openapi-generator-cli-4.0.1.jar -O /tmp/swagger/swagger-codegen-cli.jar && \
    java -jar /tmp/swagger/swagger-codegen-cli.jar generate \
    	-i api/service.swagger.json \
    	-g python \
		--package-name kubeflow.metadata.openapi_client \
    	-o /tmp/swagger && \
    rm -rf sdk/python/kubeflow/metadata/swagger_client && \
    cp -r /tmp/swagger/kubeflow/metadata/openapi_client sdk/python/kubeflow/metadata && \
    rm -rf /tmp/swagger
