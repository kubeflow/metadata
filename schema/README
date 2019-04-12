# Metadata 

This directory contains versions of predefined metadata types in the form of [JSON schema](https://json-schema.org). We expect every piece of metadata to have the following information:

- `id`of type _string_. The unique identifier assigned by this system.
- `name` of type _string_. Name of the metadata assigned by an external system.
- _type_. We need type information to make the metadata self-explanatory and follow the Kubernetes convention to require explicit version of the type. The following three fields together uniquely identify a version of a type.
    - `kind` of type _string_. Name of the type.
    - `namespace` of type _string_. The namespace of the type to avoid collision.
    - `apiversion` of type _string_. The version of the type.
- `category` of type `string`. We categorize metadata based on its role in Kubeflow systems:
   - _artifact_
   - _execution_
   - _container_

The easiest way to comply with these requirements is to extend the `alpha/entity.json` schema.

# Predefined Metadata
 These schemas are loaded by the metadata service before it starts. Therefore metadata of these types can be directly logged to the metadata store.

## Folder structure

- Different version of metadata schema should be organized as `<version>/<relative path>`.
- `/examples` folder containers the example metadata as JSON file
    - `$id` points to the its schema,
    - `example` is an JSON of metadata example.
- `schema_test.go` validates all schemas in sub-directories and examples in `/examples`.