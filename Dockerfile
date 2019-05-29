# Build docker image at gcr.io/images-public/metadata:<tag>

FROM golang:1.12

ENV GO111MODULE on

RUN apt-get update && apt-get -y install cmake unzip patch && apt-get clean

RUN cd /tmp && \
    wget -O /tmp/bazel-installer.sh https://github.com/bazelbuild/bazel/releases/download/0.24.1/bazel-0.24.1-installer-linux-x86_64.sh && \
    chmod +x bazel-installer.sh && \
    ./bazel-installer.sh --user

ENV PATH=/root/bin:${PATH}

WORKDIR /go/src/github.com/kubeflow/metadata

COPY . .

RUN bazel build -c opt --define=grpc_no_ares=true //...

RUN cp bazel-bin/server/linux_amd64_stripped/server server/server

CMD ["./server/server"]

