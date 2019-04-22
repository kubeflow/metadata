#!/bin/bash
#
# Generate README file for JSON schema
#
# Requirement:
# $ npm install -g @adobe/jsonschema2md
#
# Run
# metadata/schema$ ./generate_doc.sh

rm -rf alpha/docs && \
  jsonschema2md -d alpha/ -o alpha/docs -e json -v 07 -n

rm alpha/docs/**/*.json
rm alpha/docs/*.json
