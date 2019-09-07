# MlMetadataArtifactType

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | The id of the type. 1-1 relationship between type names and IDs. | [optional] 
**Name** | **string** | The name of the type. | [optional] 
**Properties** | [**map[string]MlMetadataPropertyType**](ml_metadataPropertyType.md) | The schema of the type. Properties are always optional in the artifact. Properties of an artifact type can be expanded but not contracted (i.e., you can add columns but not remove them). | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


