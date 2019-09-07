# \MetadataServiceApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateArtifact**](MetadataServiceApi.md#CreateArtifact) | **Post** /api/v1alpha1/artifact_types/{parent}/artifacts | NOTE: The order of the following RPC methods affects the order of matching a particular HTTP path. So put a more specific path pattern before a generic one. For example, GET /api/v1alpha1/artifact_types/{parent}/artifacts should appear before GET /api/v1alpha1/artifact_types/{name} to be possibly matched.
[**CreateArtifactType**](MetadataServiceApi.md#CreateArtifactType) | **Post** /api/v1alpha1/artifact_types | 
[**CreateEvent**](MetadataServiceApi.md#CreateEvent) | **Post** /api/v1alpha1/events | 
[**CreateExecution**](MetadataServiceApi.md#CreateExecution) | **Post** /api/v1alpha1/execution_types/{parent}/executions | 
[**CreateExecutionType**](MetadataServiceApi.md#CreateExecutionType) | **Post** /api/v1alpha1/execution_types | 
[**DeleteArtifact**](MetadataServiceApi.md#DeleteArtifact) | **Delete** /api/v1alpha1/artifact_types/{name}/artifacts/{id} | 
[**DeleteArtifactType**](MetadataServiceApi.md#DeleteArtifactType) | **Delete** /api/v1alpha1/artifact_types/{name} | 
[**DeleteExecution**](MetadataServiceApi.md#DeleteExecution) | **Delete** /api/v1alpha1/execution_types/{name}/executions/{id} | 
[**DeleteExecutionType**](MetadataServiceApi.md#DeleteExecutionType) | **Delete** /api/v1alpha1/execution_types/{name} | 
[**GetArtifact**](MetadataServiceApi.md#GetArtifact) | **Get** /api/v1alpha1/artifact_types/{name}/artifacts/{id} | 
[**GetArtifactType**](MetadataServiceApi.md#GetArtifactType) | **Get** /api/v1alpha1/artifact_types/{name} | 
[**GetExecution**](MetadataServiceApi.md#GetExecution) | **Get** /api/v1alpha1/execution_types/{name}/executions/{id} | 
[**GetExecutionType**](MetadataServiceApi.md#GetExecutionType) | **Get** /api/v1alpha1/execution_types/{name} | 
[**ListArtifactTypes**](MetadataServiceApi.md#ListArtifactTypes) | **Get** /api/v1alpha1/artifact_types | 
[**ListArtifacts**](MetadataServiceApi.md#ListArtifacts) | **Get** /api/v1alpha1/artifact_types/{name}/artifacts | 
[**ListArtifacts2**](MetadataServiceApi.md#ListArtifacts2) | **Get** /api/v1alpha1/artifacts | 
[**ListEvents**](MetadataServiceApi.md#ListEvents) | **Get** /api/v1alpha1/events/executions/{name} | List events based on an artifact or execution id.
[**ListEvents2**](MetadataServiceApi.md#ListEvents2) | **Get** /api/v1alpha1/events/artifacts/{name} | List events based on an artifact or execution id.
[**ListExecutionTypes**](MetadataServiceApi.md#ListExecutionTypes) | **Get** /api/v1alpha1/execution_types | 
[**ListExecutions**](MetadataServiceApi.md#ListExecutions) | **Get** /api/v1alpha1/execution_types/{name}/executions | 
[**ListExecutions2**](MetadataServiceApi.md#ListExecutions2) | **Get** /api/v1alpha1/executions | 



## CreateArtifact

> ApiCreateArtifactResponse CreateArtifact(ctx, parent, body)
NOTE: The order of the following RPC methods affects the order of matching a particular HTTP path. So put a more specific path pattern before a generic one. For example, GET /api/v1alpha1/artifact_types/{parent}/artifacts should appear before GET /api/v1alpha1/artifact_types/{name} to be possibly matched.

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**parent** | **string**| Creates the specified artifact as an instance of ArtifactType with this fully qualified name. |parent| takes the form &#x60;artifact_types/{namespace}/{name&gt;}&#x60;. | 
**body** | [**MlMetadataArtifact**](MlMetadataArtifact.md)| The Artifact to create. Note that Artifact.type_id is ignored. | 

### Return type

[**ApiCreateArtifactResponse**](apiCreateArtifactResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateArtifactType

> ApiCreateArtifactTypeResponse CreateArtifactType(ctx, body)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**body** | [**MlMetadataArtifactType**](MlMetadataArtifactType.md)|  | 

### Return type

[**ApiCreateArtifactTypeResponse**](apiCreateArtifactTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateEvent

> map[string]interface{} CreateEvent(ctx, body)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**body** | [**MlMetadataEvent**](MlMetadataEvent.md)|  | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateExecution

> ApiCreateExecutionResponse CreateExecution(ctx, parent, body)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**parent** | **string**| Creates the specified artifact as an instance of ExecutionType with this fully qualified name. |parent| takes the form &#x60;execution_types/{namespace}/{name&gt;}&#x60;. | 
**body** | [**MlMetadataExecution**](MlMetadataExecution.md)| The Execution to create. Note that Execution.type_id is ignored. | 

### Return type

[**ApiCreateExecutionResponse**](apiCreateExecutionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateExecutionType

> ApiCreateExecutionTypeResponse CreateExecutionType(ctx, body)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**body** | [**MlMetadataExecutionType**](MlMetadataExecutionType.md)|  | 

### Return type

[**ApiCreateExecutionTypeResponse**](apiCreateExecutionTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteArtifact

> map[string]interface{} DeleteArtifact(ctx, id, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string**|  | 
**name** | **string**|  | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteArtifactType

> map[string]interface{} DeleteArtifactType(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteExecution

> map[string]interface{} DeleteExecution(ctx, id, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string**|  | 
**name** | **string**|  | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteExecutionType

> map[string]interface{} DeleteExecutionType(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetArtifact

> ApiGetArtifactResponse GetArtifact(ctx, id, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string**|  | 
**name** | **string**| Artifact name is like &#x60;artifact_types/{namespace}/{typename}/artifact/{id}&#x60;. | 

### Return type

[**ApiGetArtifactResponse**](apiGetArtifactResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetArtifactType

> ApiGetArtifactTypeResponse GetArtifactType(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**| ArtifactType names are of the form &#x60;artifact_types/{namespace}/{name}&#x60;. | 

### Return type

[**ApiGetArtifactTypeResponse**](apiGetArtifactTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetExecution

> ApiGetExecutionResponse GetExecution(ctx, id, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string**|  | 
**name** | **string**| Execution name is like &#x60;execution_types/{namespace}/{typename}/execution/{id}&#x60;. | 

### Return type

[**ApiGetExecutionResponse**](apiGetExecutionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetExecutionType

> ApiGetExecutionTypeResponse GetExecutionType(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**ApiGetExecutionTypeResponse**](apiGetExecutionTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListArtifactTypes

> ApiListArtifactTypesResponse ListArtifactTypes(ctx, )


### Required Parameters

This endpoint does not need any parameter.

### Return type

[**ApiListArtifactTypesResponse**](apiListArtifactTypesResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListArtifacts

> ApiListArtifactsResponse ListArtifacts(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**ApiListArtifactsResponse**](apiListArtifactsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListArtifacts2

> ApiListArtifactsResponse ListArtifacts2(ctx, optional)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
 **optional** | ***ListArtifacts2Opts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ListArtifacts2Opts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **name** | **optional.String**|  | 

### Return type

[**ApiListArtifactsResponse**](apiListArtifactsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListEvents

> ApiListEventsResponse ListEvents(ctx, name)
List events based on an artifact or execution id.

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**ApiListEventsResponse**](apiListEventsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListEvents2

> ApiListEventsResponse ListEvents2(ctx, name)
List events based on an artifact or execution id.

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**ApiListEventsResponse**](apiListEventsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListExecutionTypes

> ApiListExecutionTypesResponse ListExecutionTypes(ctx, )


### Required Parameters

This endpoint does not need any parameter.

### Return type

[**ApiListExecutionTypesResponse**](apiListExecutionTypesResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListExecutions

> ApiListExecutionsResponse ListExecutions(ctx, name)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**name** | **string**|  | 

### Return type

[**ApiListExecutionsResponse**](apiListExecutionsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListExecutions2

> ApiListExecutionsResponse ListExecutions2(ctx, optional)


### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
 **optional** | ***ListExecutions2Opts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ListExecutions2Opts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **name** | **optional.String**|  | 

### Return type

[**ApiListExecutionsResponse**](apiListExecutionsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

