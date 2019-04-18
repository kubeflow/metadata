
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/artifacts/data_set.json
```

alpha schema for a data set in Kubeflow

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [artifacts/data_set.json](data_set.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/artifacts/data_set.json`
  * [artifact](artifact.md) `http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json`


##  Example
```json
{
  "annotations": {
    "mylabel": "l1",
    "tag": "data-set"
  },
  "apiversion": "v1",
  "category": "artifact",
  "create_time": "2018-11-13T20:20:39+00:00",
  "description": "a example data",
  "id": "123",
  "kind": "data_set",
  "name": "mytable-dump",
  "namespace": "kubeflow.org",
  "owner": "owner@my-company.org",
  "uri": "file://path/to/dataset",
  "version": "v1.0.0",
  "query": "SELECT * FROM mytable"
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [apiversion](#apiversion) | complex | **Required**  | No |  (this schema) |
| [category](#category) | complex | **Required**  | No | [artifact](artifact.md#category) |
| [kind](#kind) | complex | **Required**  | No |  (this schema) |
| [namespace](#namespace) | complex | **Required**  | No |  (this schema) |
| [query](#query) | `string` | Optional  | No |  (this schema) |
| [uri](#uri) | `string` | **Required**  | No | [artifact](artifact.md#uri) |
| [version](#version) | `string` | Optional  | No | [artifact](artifact.md#version) |
| `*` | any | Additional | Yes | this schema *allows* additional properties |

## apiversion


`apiversion`

* is **required**
* type: complex
* defined in this schema

### apiversion Type

Unknown type ``.

```json
{
  "constant": "alpha",
  "isrequired": true,
  "simpletype": "complex"
}
```





## category


`category`

* is **required**
* type: complex
* defined in [artifact](artifact.md#category)

### category Type

Unknown type ``.

```json
{
  "constant": "artifact",
  "$oSchema": {
    "$linkVal": "artifact",
    "$linkPath": "artifact.md"
  },
  "isrequired": true,
  "simpletype": "complex"
}
```





## kind


`kind`

* is **required**
* type: complex
* defined in this schema

### kind Type

Unknown type ``.

```json
{
  "constant": "data_set",
  "isrequired": true,
  "simpletype": "complex"
}
```





## namespace


`namespace`

* is **required**
* type: complex
* defined in this schema

### namespace Type

Unknown type ``.

```json
{
  "constant": "kubeflow.org",
  "isrequired": true,
  "simpletype": "complex"
}
```





## query

query to get the data

`query`

* is optional
* type: `string`
* defined in this schema

### query Type


`string`







## uri

unique resource identifier to the artifact

`uri`

* is **required**
* type: `string`
* defined in [artifact](artifact.md#uri)

### uri Type


`string`






### uri Examples

```json
"file://path/to/a/local/file"
```

```json
"gcs://path/to/a/gcs/file"
```

```json
"http://github.com/my-project/path/to/a/file"
```



## version

entity version assigned by an external system

`version`

* is optional
* type: `string`
* defined in [artifact](artifact.md#version)

### version Type


`string`






### version Examples

```json
"v1.3.2"
```

```json
"e5a89c1eb6a836ecff76437ed955144b04227ad0"
```




**All** of the following *requirements* need to be fulfilled.


#### Requirement 1


* []() – `http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json`


#### Requirement 2


