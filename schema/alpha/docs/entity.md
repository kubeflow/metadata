
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/entity.json
```

Schema for any entity. (namespace, kind, apiversion) uniquely identifies the entity type.

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [entity.json](entity.json) |

##  Example
```json
{
  "annotations": {
    "mylabel": "l1",
    "tag": "tag-abc"
  },
  "apiversion": "v1",
  "category": "artifact",
  "create_time": "2018-11-13T20:20:39+00:00",
  "description": "a example model",
  "id": "123",
  "kind": "model",
  "name": "model-1",
  "namespace": "my-company.org",
  "owner": "owner@my-company.org",
  "uri": "file://path/to/artifact",
  "version": "v1.0.0"
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [annotations](#annotations) | `object` | Optional  | No |  (this schema) |
| [apiversion](#apiversion) | `string` | **Required**  | No |  (this schema) |
| [category](#category) | `enum` | **Required**  | No |  (this schema) |
| [create_time](#create_time) | `string` | Optional  | No |  (this schema) |
| [description](#description) | `string` | Optional  | No |  (this schema) |
| [id](#id) | `string` | **Required**  | No |  (this schema) |
| [kind](#kind) | `string` | **Required**  | No |  (this schema) |
| [name](#name) | `string` | **Required**  | No |  (this schema) |
| [namespace](#namespace) | `string` | **Required**  | No |  (this schema) |
| [owner](#owner) | `string` | Optional  | No |  (this schema) |
| `*` | any | Additional | Yes | this schema *allows* additional properties |

## annotations

arbitrary string key/value pairs

`annotations`

* is optional
* type: `object`
* defined in this schema

### annotations Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|






## apiversion

version of the entity type

`apiversion`

* is **required**
* type: `string`
* defined in this schema

### apiversion Type


`string`







## category

three categories of entities

`category`

* is **required**
* type: `enum`
* defined in this schema

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
* defined in this schema

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
* defined in this schema

### description Type


`string`







## id

unique identifier for this entity

`id`

* is **required**
* type: `string`
* defined in this schema

### id Type


`string`







## kind

type of this entity

`kind`

* is **required**
* type: `string`
* defined in this schema

### kind Type


`string`







## name

name of this entity

`name`

* is **required**
* type: `string`
* defined in this schema

### name Type


`string`







## namespace

namepace of the entity type

`namespace`

* is **required**
* type: `string`
* defined in this schema

### namespace Type


`string`







## owner

owner of this entity

`owner`

* is optional
* type: `string`
* defined in this schema

### owner Type


`string`






