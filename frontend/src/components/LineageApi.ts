import {ArtifactType} from "../generated/src/apis/metadata/metadata_store_pb";
import {GetArtifactTypesRequest} from "../generated/src/apis/metadata/metadata_store_service_pb";
import {MetadataStoreServicePromiseClient} from "../generated/src/apis/metadata/metadata_store_service_grpc_web_pb";

export type ArtifactTypeMap = Map<number, ArtifactType>;

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
