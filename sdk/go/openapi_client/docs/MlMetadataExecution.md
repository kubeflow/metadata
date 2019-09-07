# MlMetadataExecution

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | The id of the execution. | [optional] 
**TypeId** | **string** | The id of an ExecutionType. The ExecutionType must be specified and cannot be changed. | [optional] 
**LastKnownState** | [**MlMetadataExecutionState**](ml_metadataExecutionState.md) |  | [optional] 
**Properties** | [**map[string]MlMetadataValue**](ml_metadataValue.md) | Properties of the Execution. Properties must be specified in the ExecutionType. | [optional] 
**CustomProperties** | [**map[string]MlMetadataValue**](ml_metadataValue.md) | User provided custom properties which are not defined by its type. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


