
#  Schema

```
http://github.com/kubeflow/metadata/schema/alpha/execution.json
```

a run of an executable

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Defined In |
|----------|------------|--------|--------------|-------------------|-----------------------|------------|
| Can be instantiated | No | Experimental | No | Forbidden | Permitted | [execution.json](execution.json) |
## Schema Hierarchy

*  `http://github.com/kubeflow/metadata/schema/alpha/execution.json`
  * [entity](entity.md) `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


##  Example
```json
{
  "apiversion": "alpha",
  "category": "execution",
  "configuration": {
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
      "labels": {
        "app": "web"
      },
      "name": "rss-site"
    },
    "spec": {
      "containers": [
        {
          "image": "nginx",
          "name": "front-end",
          "ports": [
            {
              "containerPort": "80"
            }
          ]
        },
        {
          "image": "nickchase/rss-php-nginx:v1",
          "name": "rss-reader",
          "ports": [
            {
              "containerPort": "88"
            }
          ]
        }
      ]
    }
  },
  "executable_id": "1234",
  "id": "abcd1234",
  "kind": "execution",
  "name": "my-run",
  "namespace": "kubeflow.org"
}
```

#  Properties

| Property | Type | Required | Nullable | Defined by |
|----------|------|----------|----------|------------|
| [annotations](#annotations) | `object` | Optional  | No | [entity](entity.md#annotations) |
| [apiversion](#apiversion) | `string` | **Required**  | No | [entity](entity.md#apiversion) |
| [category](#category) | `enum` | **Required**  | No | [entity](entity.md#category) |
| [configuration](#configuration) | `object` | Optional  | No |  (this schema) |
| [create_time](#create_time) | `string` | Optional  | No | [entity](entity.md#create_time) |
| [description](#description) | `string` | Optional  | No | [entity](entity.md#description) |
| [executable_id](#executable_id) | `string` | Optional  | No |  (this schema) |
| [id](#id) | `string` | **Required**  | No | [entity](entity.md#id) |
| [kind](#kind) | `string` | **Required**  | No | [entity](entity.md#kind) |
| [name](#name) | `string` | **Required**  | No | [entity](entity.md#name) |
| [namespace](#namespace) | `string` | **Required**  | No | [entity](entity.md#namespace) |
| [owner](#owner) | `string` | Optional  | No | [entity](entity.md#owner) |
| `*` | any | Additional | Yes | this schema *allows* additional properties |

## annotations

arbitrary string key/value pairs

`annotations`

* is optional
* type: `object`
* defined in [entity](entity.md#annotations)

### annotations Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|






## apiversion

version of the entity type

`apiversion`

* is **required**
* type: `string`
* defined in [entity](entity.md#apiversion)

### apiversion Type


`string`







## category

three categories of entities

`category`

* is **required**
* type: `enum`
* defined in [entity](entity.md#category)

The value of this property **must** be equal to one of the [known values below](#category-known-values).

### category Known Values
| Value | Description |
|-------|-------------|
| `artifact` |  |
| `execution` |  |
| `container` |  |




## configuration

runtime configuration for the execution

`configuration`

* is optional
* type: `object`
* defined in this schema

### configuration Type


`object` with following properties:


| Property | Type | Required |
|----------|------|----------|
| `contentEncoding`| string | Optional |
| `contentMediaType`| string | Optional |
| `value`| string | Optional |



#### contentEncoding

configuration encoding

`contentEncoding`

* is optional
* type: `string`

##### contentEncoding Type


`string`






##### contentEncoding Example

```json
base64
```




#### contentMediaType

configuration media type

`contentMediaType`

* is optional
* type: `string`

##### contentMediaType Type


`string`






##### contentMediaType Example

```json
image/png
```




#### value

configuration serizalized in string

`value`

* is optional
* type: `string`

##### value Type


`string`












## create_time

time when entity is created in the format of RFC3339

`create_time`

* is optional
* type: `string`
* defined in [entity](entity.md#create_time)

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
* defined in [entity](entity.md#description)

### description Type


`string`







## executable_id

the id of the executable

`executable_id`

* is optional
* type: `string`
* defined in this schema

### executable_id Type


`string`







## id

unique identifier for this entity

`id`

* is **required**
* type: `string`
* defined in [entity](entity.md#id)

### id Type


`string`







## kind

type of this entity

`kind`

* is **required**
* type: `string`
* defined in [entity](entity.md#kind)

### kind Type


`string`







## name

name of this entity

`name`

* is **required**
* type: `string`
* defined in [entity](entity.md#name)

### name Type


`string`







## namespace

namepace of the entity type

`namespace`

* is **required**
* type: `string`
* defined in [entity](entity.md#namespace)

### namespace Type


`string`







## owner

owner of this entity

`owner`

* is optional
* type: `string`
* defined in [entity](entity.md#owner)

### owner Type


`string`








**All** of the following *requirements* need to be fulfilled.


#### Requirement 1


* []() – `http://github.com/kubeflow/metadata/schema/alpha/entity.json`


#### Requirement 2


