
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/artifacts/executable.json
```

schema for an executable, extension of an artifact

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [artifacts/executable.json](executable.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/artifacts/executable.json`
  * [entity](../entity.md) `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


##  Example
```json
{
  "category": "artifact",
  "id": "1234",
  "input_type": [
    {
      "apiversion": "v1",
      "category": "artifact",
      "kind": "data_set",
      "namespace": "my-company.org"
    }
  ],
  "kind": "my-traning-code",
  "namespace": "my-company.org",
  "output_type": [
    {
      "apiversion": "v1",
      "category": "artifact",
      "kind": "model",
      "namespace": "my-company.org"
    }
  ],
  "apiversion": "v1",
  "uri": "file://local_file.py",
  "name": "my-processor"
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [annotations](#annotations) | `object` | Optional  | No | [entity](../entity.md#annotations) |
| [apiversion](#apiversion) | `string` | **Required**  | No | [entity](../entity.md#apiversion) |
| [category](#category) | `enum` | **Required**  | No | [entity](../entity.md#category) |
| [create_time](#create_time) | `string` | Optional  | No | [entity](../entity.md#create_time) |
| [description](#description) | `string` | Optional  | No | [entity](../entity.md#description) |
| [id](#id) | `string` | **Required**  | No | [entity](../entity.md#id) |
| [input_type](#input_type) | `object[]` | Optional  | No |  (this schema) |
| [kind](#kind) | `string` | **Required**  | No | [entity](../entity.md#kind) |
| [name](#name) | `string` | **Required**  | No | [entity](../entity.md#name) |
| [namespace](#namespace) | `string` | **Required**  | No | [entity](../entity.md#namespace) |
| [output_type](#output_type) | `object[]` | Optional  | No |  (this schema) |
| [owner](#owner) | `string` | Optional  | No | [entity](../entity.md#owner) |
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







## input_type


`input_type`

* is optional
* type: `object[]`
* defined in this schema

### input_type Type


Array type: `object[]`

All items must be of the type:
`object` with following properties:


| Property | Type | Required |
|----------|------|----------|








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







## output_type


`output_type`

* is optional
* type: `object[]`
* defined in this schema

### output_type Type


Array type: `object[]`

All items must be of the type:
`object` with following properties:


| Property | Type | Required |
|----------|------|----------|








## owner

owner of this entity

`owner`

* is optional
* type: `string`
* defined in [entity](../entity.md#owner)

### owner Type


`string`








**All** of the following *requirements* need to be fulfilled.


#### Requirement 1


* []() – `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


#### Requirement 2


