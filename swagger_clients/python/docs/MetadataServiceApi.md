# swagger_client.MetadataServiceApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_artifact_type**](MetadataServiceApi.md#create_artifact_type) | **POST** /api/v1alpha1/artifact_types | 
[**delete_artifact_type**](MetadataServiceApi.md#delete_artifact_type) | **DELETE** /api/v1alpha1/artifact_types/{id} | 
[**get_artifact_type**](MetadataServiceApi.md#get_artifact_type) | **GET** /api/v1alpha1/artifact_type/{id} | 
[**list_artifact_types**](MetadataServiceApi.md#list_artifact_types) | **GET** /api/v1alpha1/artifact_types | 


# **create_artifact_type**
> ApiCreateArtifactTypeResponse create_artifact_type(body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.MetadataServiceApi()
body = swagger_client.ApiArtifactType() # ApiArtifactType | 

try:
    api_response = api_instance.create_artifact_type(body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling MetadataServiceApi->create_artifact_type: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ApiArtifactType**](ApiArtifactType.md)|  | 

### Return type

[**ApiCreateArtifactTypeResponse**](ApiCreateArtifactTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_artifact_type**
> object delete_artifact_type(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.MetadataServiceApi()
id = 'id_example' # str | 

try:
    api_response = api_instance.delete_artifact_type(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling MetadataServiceApi->delete_artifact_type: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_artifact_type**
> ApiGetArtifactTypeResponse get_artifact_type(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.MetadataServiceApi()
id = 'id_example' # str | 

try:
    api_response = api_instance.get_artifact_type(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling MetadataServiceApi->get_artifact_type: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**ApiGetArtifactTypeResponse**](ApiGetArtifactTypeResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_artifact_types**
> ApiListArtifactTypesResponse list_artifact_types()



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.MetadataServiceApi()

try:
    api_response = api_instance.list_artifact_types()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling MetadataServiceApi->list_artifact_types: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ApiListArtifactTypesResponse**](ApiListArtifactTypesResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

