
GIT_VERSION:=$(shell git describe --dirty --always)

PROJECT:=kubeflow-images-public
GCBPROJECT:=kubeflow-releasing

IMAGE:=gcr.io/$(PROJECT)/metadata-watcher:$(GIT_VERSION)

# Echo commands
SHELL = sh -xv

LATESTIMAGES=latest_image.yaml

build-submit:
	# We need to cd to the parent directory to include source for both tff-fake
	# and tff-task
	cd .. && gcloud --project=$(GCBPROJECT) builds submit \
		--substitutions=_FULLIMAGE=$(IMAGE) \
		--machine-type=n1-highcpu-32 \
		--config=./watcher/cloudbuild.yaml

build-output:
	yq w -i latest_image.yaml $(PROJECT).metadata-watcher.image \
	  $(IMAGE)@$(shell gcloud container images describe $(IMAGE) | yq r - image_summary.digest)

set-image:
	cd  dockerfiles && kustomize edit set image watcher=$(shell yq r $(LATESTIMAGES) $(PROJECT).metadata-watcher.image)

update-image: build-submit build-output set-image


build:
	go build -o .build/watcher main/main.go

test: build
	./main/main -kubeconfig=${HOME}/.kube/config -metadata_service=localhost:8080 -resourcelist=dockerfiles/resource_list.json

docker-image:
	cd .. && \
	docker build -t gcr.io/kubeflow-images-public/metadata/watcher -f watcher/dockerfiles/Dockerfile .

deploy:
	kubectl apply -f dockerfiles/role.yaml && \
	kubectl apply -f dockerfiles/rolebinding.yaml && \
	kubectl apply -f dockerfiles/watcher.yaml -n kubeflow
