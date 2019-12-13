import {ArtifactTypeMap} from "./LineageApi";

export function getTypeName(typeId: number, artifactTypes: ArtifactTypeMap): string {
  return artifactTypes && artifactTypes.get(typeId!) ?
    artifactTypes.get(typeId!)!.getName() : String(typeId);
}
