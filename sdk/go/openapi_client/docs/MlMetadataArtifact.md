# MlMetadataArtifact

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | The id of the artifact. | [optional] 
**TypeId** | **string** | The id of an ArtifactType. Type must be specified when an artifact is created, and it cannot be changed. | [optional] 
**Uri** | **string** | The uniform resource identifier of the physical artifact. May be empty if there is no physical artifact. | [optional] 
**Properties** | [**map[string]MlMetadataValue**](ml_metadataValue.md) | Properties of the artifact. Properties must be specified in the ArtifactType. | [optional] 
**CustomProperties** | [**map[string]MlMetadataValue**](ml_metadataValue.md) | User provided custom properties which are not defined by its type. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


