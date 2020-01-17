import {ArtifactType, ExecutionType} from "../generated/src/apis/metadata/metadata_store_pb";
import {GetArtifactTypesRequest, GetExecutionTypesRequest} from "../generated/src/apis/metadata/metadata_store_service_pb";
import {MetadataStoreServicePromiseClient} from "../generated/src/apis/metadata/metadata_store_service_grpc_web_pb";

export type ArtifactTypeMap = Map<number, ArtifactType>;
export type ExecutionTypeMap = Map<number, ExecutionType>;

export async function getArtifactTypes(
  metadataStoreService: MetadataStoreServicePromiseClient,
  errorCallback?: (message: string) => void
): Promise<ArtifactTypeMap> {
  const response =
    await metadataStoreService.getArtifactTypes(new GetArtifactTypesRequest());

  if (!response) {
    if (errorCallback) {
      errorCallback('Unable to retrieve Artifact Types, some features may not work.');
    }
    return new Map();
  }

  const artifactTypesMap = new Map<number, ArtifactType>();

  (response!.getArtifactTypesList() || []).forEach((artifactType: ArtifactType) => {
    artifactTypesMap.set(artifactType.getId()!, artifactType);
  });

  return artifactTypesMap;
}

export async function getExecutionTypes(
  metadataStoreService: MetadataStoreServicePromiseClient,
  errorCallback?: (message: string) => void
): Promise<ExecutionTypeMap> {
  const response =
    await metadataStoreService.getExecutionTypes(new GetExecutionTypesRequest());

  if (!response) {
    if (errorCallback) {
      errorCallback('Unable to retrieve Execution Types, some features may not work.');
    }
    return new Map();
  }

  const executionTypesMap = new Map<number, ExecutionType>();

  (response!.getExecutionTypesList() || []).forEach((executionType: ExecutionType) => {
    executionTypesMap.set(executionType.getId()!, executionType);
  });

  return executionTypesMap;
}
