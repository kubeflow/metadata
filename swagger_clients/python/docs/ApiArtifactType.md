# ApiArtifactType

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** | System-provided id. | [optional] 
**name** | **str** | Required. Represents the name of a type. Must be unique within a namespace. | [optional] 
**namespace** | [**ApiNamespace**](ApiNamespace.md) | Represents the namespace under which to store this type. Empty defaults to the default, system-defined namespace. | [optional] 
**type_properties** | [**dict(str, ApiType)**](ApiType.md) | Schema representing the fields and their types for this artifact. | [optional] 
**description** | **str** | An optional human-readable description of this type. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


