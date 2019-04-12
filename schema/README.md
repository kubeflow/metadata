# Metadata Schema

This directory contains all predefined metadata types in the form of [JSON schema](https://json-schema.org). We expect every piece of metadata to have the following fields:

- `id`of type _string_. Unique identifier assigned by this metadata service.
- `name` of type _string_. Name of the metadata assigned by external users.
- _type information_. We need type information to make the metadata self-explanatory and require explicit version of the type, following the Kubernetes convention. The following three fields together uniquely identify a version of a type.
    - `kind` of type _string_. Name of the type.
    - `namespace` of type _string_. The namespace of the type to avoid naming collision.
    - `apiversion` of type _string_. The version of the type.
- `category` of type _string_. We categorize metadata based on its role in Kubeflow systems:
   - _"artifact"_ represents input data and derived data in a workflow.E.g. _data set_, _model_.
   - _"execution"_ represents a run of an excutable, which can have artifacts as input and/or output.
   - _"container"_ represents a group of artifacts, executions, and other containers. E.g. _workspace_ for solving a ML problem and _Katib experiment_ for creating multiple models.

It is not necessary, but the easiest way to comply with these requirements is to extend the `alpha/entity.json` schema.

# Predefined Metadata
This directory contains versions of predefined metadata schemas, which are loaded by the metadata service before it starts. Therefore metadata of these types can be directly logged to the metadata store.

## Folder Structure

- Different versions of metadata schema should be organized as `<version>/<relative path>`.
- `/examples` folder containers the example metadata as JSON files. In each file,
    - field `$id` points to the its schema,
    - field `example` is a JSON of metadata example.
- `schema_test.go` validates all schemas in sub-directories and examples in `/examples`.

# Customize Metadata
Customized metadata is defined in the same schema format as predefined metadata. The only difference between them is that customized metadata schemas are loaded by sending requests to the schema registration endpoint. (TODO: add link) 