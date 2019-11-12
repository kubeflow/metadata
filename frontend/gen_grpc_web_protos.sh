#!/usr/bin/env bash
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
OUT_DIR="./src/generated"

if [[ ! -d ${OUT_DIR} ]]; then
  mkdir ${OUT_DIR}
fi

# Expects protoc to be on your PATH.
#
# From npm/google-protobuf:
# The compiler is not currently available via npm, but you can download a
# pre-built binary on GitHub (look for the protoc-*.zip files under Downloads).
protoc \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="service=grpc-web:${OUT_DIR}" \
    src/apis/**/*.proto
