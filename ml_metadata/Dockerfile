# Dockerfile to build image for ml-metadata GRPC server.

FROM ubuntu:xenial

RUN set -ex && \
    apt-get update -yqq && \
    apt-get install -yqq --no-install-recommends \
    build-essential cmake wget git gcc ca-certificates unzip

RUN cd /tmp && \
    wget -O /tmp/bazel-installer.sh https://github.com/bazelbuild/bazel/releases/download/0.24.1/bazel-0.24.1-installer-linux-x86_64.sh && \
    chmod +x bazel-installer.sh && \
    ./bazel-installer.sh --user

ENV PATH=/root/bin:${PATH}

RUN git clone https://github.com/google/ml-metadata.git /tmp/ml-metadata && \
    cd /tmp/ml-metadata && \
    bazel build -c opt --define grpc_no_ares=true  //ml_metadata/metadata_store:metadata_store_server

WORKDIR /root

RUN cp /tmp/ml-metadata/bazel-bin/ml_metadata/metadata_store/metadata_store_server /root/metadata_store_server && \
    rm -rf /tmp/ml-metadata

CMD ["./metadata_store_server"]

