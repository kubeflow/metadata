
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/artifacts/metrics.json
```

metadata schema for an machine learning model

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [artifacts/metrics.json](metrics.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/artifacts/metrics.json`
  * [artifact](artifact.md) `http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json`


##  Example
```json
{
  "id": "784efef2-7285-11e9-a923-1681be663d3e",
  "kind": "metrics",
  "category": "artifact",
  "namespace": "kubeflow.org",
  "apiversion": "alpha",
  "name": "MNIST-evaluation",
  "description": "validating the MNIST model to recognize handwritten digits",
  "owner": "someone@kubeflow.org",
  "uri": "gcs://my-bucket/mnist-eval.csv",
  "data_set_id": "123",
  "model_id": "12345",
  "metrics_type": "validation",
  "values": {
    "accuracy": 0.95
  },
  "create_time": "2018-11-15T20:20:39+00:00",
  "annotations": {
    "mylabel": "l1"
  }
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [apiversion](#apiversion) | complex | **Required**  | No |  (this schema) |
| [category](#category) | complex | **Required**  | No | [artifact](artifact.md#category) |
| [data_set_id](#data_set_id) | `string` | Optional  | No |  (this schema) |
| [kind](#kind) | complex | **Required**  | No |  (this schema) |
| [metrics_type](#metrics_type) | `enum` | Optional  | No |  (this schema) |
| [model_id](#model_id) | `string` | Optional  | No |  (this schema) |
| [namespace](#namespace) | complex | **Required**  | No |  (this schema) |
| [uri](#uri) | `string` | **Required**  | No | [artifact](artifact.md#uri) |
| [values](#values) | `object` | Optional  | No |  (this schema) |
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





## data_set_id

ID of the data set used for evaluation

`data_set_id`

* is optional
* type: `string`
* defined in this schema

### data_set_id Type


`string`







## kind


`kind`

* is **required**
* type: complex
* defined in this schema

### kind Type

Unknown type ``.

```json
{
  "constant": "metrics",
  "isrequired": true,
  "simpletype": "complex"
}
```





## metrics_type


`metrics_type`

* is optional
* type: `enum`
* defined in this schema

The value of this property **must** be equal to one of the [known values below](#metrics_type-known-values).

### metrics_type Known Values
| Value | Description |
|-------|-------------|
| `training` |  |
| `validation` |  |
| `testing` |  |
| `production` |  |




## model_id

ID of the model being evaluated

`model_id`

* is optional
* type: `string`
* defined in this schema

### model_id Type


`string`







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



## values

map from metric name to its value

`values`

* is optional
* type: `object`
* defined in this schema

### values Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|






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


