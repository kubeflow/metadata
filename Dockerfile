# This file builds the metadata backend server image at
# gcr.io/kubeflow-images-public/metadata.
#
# The docker build flags are
# BASE_IMG: base image that has Go and Bazel installed.
# EXTRA_BAZEL_ARGS: extra arguments of bazel build. Set it to
# --host_javabase=@local_jdk//:jdk when build on power or arm64 machines.
# OUTPUT_DIR: the platform name that Bazel used to ouput the executable.

ARG BASE_IMG=gcr.io/kubeflow-images-public/metadata-base
FROM ${BASE_IMG}

ARG EXTRA_BAZEL_ARGS
ARG OUTPUT_DIR=linux_amd64_stripped

ENV GO111MODULE on

WORKDIR /go/src/github.com/kubeflow/metadata

COPY . .

RUN bazel build -c opt --define=grpc_no_ares=true //... ${EXTRA_BAZEL_ARGS}

RUN cp bazel-bin/server/${OUTPUT_DIR}/server server/server

# Copy Licenses
RUN wget https://github.com/grpc-ecosystem/grpc-gateway/blob/master/LICENSE.txt -O GRPC-GATEWAY-LICENSE.txt

CMD ["./server/server"]

