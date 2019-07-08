
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/artifacts/model.json
```

schema for an machine learning model

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [artifacts/model.json](model.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/artifacts/model.json`
  * [artifact](artifact.md) `http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json`


##  Example
```json
{
  "id": "12345",
  "kind": "model",
  "category": "artifact",
  "namespace": "kubeflow.org",
  "apiversion": "alpha",
  "name": "MNIST",
  "description": "model to recognize handwritten digits",
  "owner": "someone@kubeflow.org",
  "uri": "gcs://my-bucket/mnist",
  "model_type": "neural network",
  "training_framework": {
    "name": "tensorflow",
    "version": "v1.0"
  },
  "hyperparameters": {
    "learning_rate": 0.5,
    "layers": [
      10,
      3,
      1
    ],
    "early_stop": true
  },
  "version": "v0.0.1",
  "create_time": "2018-11-13T20:20:39+00:00",
  "annotations": {
    "mylabel": "l1"
  }
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [apiversion](#apiversion) | `string` | **Required**  | No |  (this schema) |
| [category](#category) | complex | **Required**  | No | [artifact](artifact.md#category) |
| [hyperparameters](#hyperparameters) | `object` | Optional  | No |  (this schema) |
| [kind](#kind) | `string` | **Required**  | No |  (this schema) |
| [model_type](#model_type) | `string` | Optional  | No |  (this schema) |
| [namespace](#namespace) | `string` | **Required**  | No |  (this schema) |
| [training_framework](#training_framework) | `object` | Optional  | No |  (this schema) |
| [uri](#uri) | `string` | **Required**  | No | [artifact](artifact.md#uri) |
| [version](#version) | `string` | Optional  | No | [artifact](artifact.md#version) |
| `*` | any | Additional | Yes | this schema *allows* additional properties |

## apiversion


`apiversion`

* is **required**
* type: `string`
* defined in this schema

### apiversion Type


`string`







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





## hyperparameters

map from param name to its value

`hyperparameters`

* is optional
* type: `object`
* defined in this schema

### hyperparameters Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|






## kind


`kind`

* is **required**
* type: `string`
* defined in this schema

### kind Type


`string`







## model_type

the type of the model

`model_type`

* is optional
* type: `string`
* defined in this schema

### model_type Type


`string`






### model_type Examples

```json
"liner regression"
```

```json
"neural network"
```



## namespace


`namespace`

* is **required**
* type: `string`
* defined in this schema

### namespace Type


`string`







## training_framework


`training_framework`

* is optional
* type: `object`
* defined in this schema

### training_framework Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|
| `name`| string | Optional |
| `version`| string | Optional |



#### name


`name`

* is optional
* type: `string`

##### name Type


`string`









#### version


`version`

* is optional
* type: `string`

##### version Type


`string`











### training_framework Example

```json
{
  "name": "tensorflow",
  "version": "v1.0"
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


