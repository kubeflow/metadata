# Build docker image at gcr.io/images-public/metadata:<tag>

FROM golang:1.12

ENV GO111MODULE on

RUN apt-get update && apt-get -y install unzip patch && apt-get clean

# Install Bazel
RUN cd /tmp && \
    wget -O /tmp/bazel-installer.sh https://github.com/bazelbuild/bazel/releases/download/0.24.1/bazel-0.24.1-installer-linux-x86_64.sh && \
    chmod +x bazel-installer.sh && \
    ./bazel-installer.sh --user

ENV PATH=/root/bin:${PATH}

WORKDIR /go/src/github.com/kubeflow/metadata

COPY . .

RUN cd server && go build ./...

CMD ["./server/server"]

