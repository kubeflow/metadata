hello:
	curl localhost:8080/api/v1/resource/my-resource

mlmd-proto:
	rm -rf /tmp/ml-metadata && \
	git clone https://github.com/google/ml-metadata.git /tmp/ml-metadata && \
	rm -rf ml_metadata/proto && \
	mkdir ml_metadata/proto && \
	cp /tmp/ml-metadata/ml_metadata/proto/*.proto ml_metadata/proto && \
	protoc -I . ml_metadata/proto/*.proto --go_out=plugins=grpc:. && \
	mv ml_metadata/proto/*.go ml_metadata/

mlmd-docker-image:
	docker build -t gcr.io/kubeflow-images-public/ml-metadata -f ml_metadata/Dockerfile .

metadata-docker-image:
	docker build -t gcr.io/kubeflow-images-public/metadata .


build:
	go build ./...

test:
	go test ./...
