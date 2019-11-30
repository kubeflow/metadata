#!/usr/bin/env powershell 

# This script is used to send requests to a Kubeflow metadata server to
# verify it works.

$Host_Addr = "http://localhost"
$PORT = 8080

$CommonParams = @{"ContentType" = "application/json"}
# List all artifact types.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifact_types" @CommonParams | ConvertTo-Json -Compress

# List the predefined model type.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model" @CommonParams | ConvertTo-Json -Compress

# Update the specified model type.
Invoke-RestMethod -Method 'PATCH' "${Host_Addr}:$PORT/api/v1alpha1/artifact_types" -Body $(cat update_model_type.json) @CommonParams | ConvertTo-Json -Compress
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model" @CommonParams | ConvertTo-Json -Compress

# Add a model artifact
Invoke-RestMethod -Method 'POST' "${Host_Addr}:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts" -Body $(cat artifact_model_1.json) @CommonParams | ConvertTo-Json -Compress

# List all artifacts.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifacts" @CommonParams | ConvertTo-Json -Compress

# List all model artifacts
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts" @CommonParams | ConvertTo-Json -Compress

# Get the model artifcat with ID=1.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/artifact_types/kubeflow.org/alpha/model/artifacts/1" @CommonParams | ConvertTo-Json -Compress

# List all execution types.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/execution_types" @CommonParams | ConvertTo-Json -Compress

# List the predefined execution type.
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/execution_types/kubeflow.org/alpha/execution" @CommonParams | ConvertTo-Json -Compress

# Update the the specified execution type.
Invoke-RestMethod -Method 'PATCH' "${Host_Addr}:$PORT/api/v1alpha1/execution_types" -Body $(cat update_execution_type.json) @CommonParams | ConvertTo-Json -Compress
Invoke-RestMethod "${Host_Addr}:$PORT/api/v1alpha1/execution_types/kubeflow.org/alpha/execution" @CommonParams | ConvertTo-Json -Compress