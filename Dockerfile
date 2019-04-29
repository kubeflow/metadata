# Build docker image at gcr.io/images-public/metadata:<tag>

FROM golang:1.12

ENV GO111MODULE on

WORKDIR /go/src/github.com/kubeflow/metadata

COPY . .

RUN cd server && go build ./...

CMD ["./server/server"]

