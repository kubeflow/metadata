
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json
```

schema for an artifact, an extension of entity

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [artifacts/artifact.json](artifact.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/artifacts/artifact.json`
  * [entity](../entity.md) `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [annotations](#annotations) | `object` | Optional  | No | [entity](../entity.md#annotations) |
| [apiversion](#apiversion) | `string` | **Required**  | No | [entity](../entity.md#apiversion) |
| [category](#category) | `enum` | **Required**  | No | [entity](../entity.md#category) |
| [create_time](#create_time) | `string` | Optional  | No | [entity](../entity.md#create_time) |
| [description](#description) | `string` | Optional  | No | [entity](../entity.md#description) |
| [id](#id) | `string` | **Required**  | No | [entity](../entity.md#id) |
| [kind](#kind) | `string` | **Required**  | No | [entity](../entity.md#kind) |
| [name](#name) | `string` | **Required**  | No | [entity](../entity.md#name) |
| [namespace](#namespace) | `string` | **Required**  | No | [entity](../entity.md#namespace) |
| [owner](#owner) | `string` | Optional  | No | [entity](../entity.md#owner) |
| [uri](#uri) | `string` | **Required**  | No |  (this schema) |
| [version](#version) | `string` | Optional  | No |  (this schema) |
| `*` | any | Additional | Yes | this schema *allows* additional properties |

## annotations

arbitrary string key/value pairs

`annotations`

* is optional
* type: `object`
* defined in [entity](../entity.md#annotations)

### annotations Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|






## apiversion

version of the entity type

`apiversion`

* is **required**
* type: `string`
* defined in [entity](../entity.md#apiversion)

### apiversion Type


`string`







## category

three categories of entities

`category`

* is **required**
* type: `enum`
* defined in [entity](../entity.md#category)

The value of this property **must** be equal to one of the [known values below](#category-known-values).

### category Known Values
| Value | Description |
|-------|-------------|
| `artifact` |  |
| `execution` |  |
| `container` |  |




## create_time

time when entity is created in the format of RFC3339

`create_time`

* is optional
* type: `string`
* defined in [entity](../entity.md#create_time)

### create_time Type


`string`

* format: `date-time` – date and time (according to [RFC 3339, section 5.6](http://tools.ietf.org/html/rfc3339))




### create_time Example

```json
"2018-11-13T20:20:39+00:00"
```


## description

description of this entity

`description`

* is optional
* type: `string`
* defined in [entity](../entity.md#description)

### description Type


`string`







## id

unique identifier for this entity

`id`

* is **required**
* type: `string`
* defined in [entity](../entity.md#id)

### id Type


`string`







## kind

type of this entity

`kind`

* is **required**
* type: `string`
* defined in [entity](../entity.md#kind)

### kind Type


`string`







## name

name of this entity

`name`

* is **required**
* type: `string`
* defined in [entity](../entity.md#name)

### name Type


`string`







## namespace

namepace of the entity type

`namespace`

* is **required**
* type: `string`
* defined in [entity](../entity.md#namespace)

### namespace Type


`string`







## owner

owner of this entity

`owner`

* is optional
* type: `string`
* defined in [entity](../entity.md#owner)

### owner Type


`string`







## uri

unique resource identifier to the artifact

`uri`

* is **required**
* type: `string`
* defined in this schema

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
* defined in this schema

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


* []() – `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


#### Requirement 2


