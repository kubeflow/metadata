import {MetadataServiceApi} from '../apis/service';
import {MetadataStoreServicePromiseClient} from '../generated/src/apis/metadata/metadata_store_service_grpc_web_pb';

/** Known Artifact properties */
export enum ArtifactProperties {
  ALL_META = '__ALL_META__',
  CREATE_TIME = 'create_time',
  DESCRIPTION = 'description',
  NAME = 'name',
  PIPELINE_NAME = 'pipeline_name',
  VERSION = 'version',
}

/** Known Artifact custom properties */
export enum ArtifactCustomProperties {
  WORKSPACE = '__kf_workspace__',
  RUN = '__kf_run__',
}

/** Known Execution properties */
export enum ExecutionProperties {
  NAME = 'name',
  PIPELINE_NAME = 'pipeline_name',
  STATE = 'state',
}

/** Known Execution custom properties */
export enum ExecutionCustomProperties {
  WORKSPACE = '__kf_workspace__',
}

/** Format for a List request */
export interface ListRequest {
  filter?: string;
  orderAscending?: boolean;
  pageSize?: number;
  pageToken?: string;
  sortBy?: string;
}

/**
 * Class to wrap backend APIs.
 */
export class Api {

  private static instance: Api;
  private metadataServiceApi: MetadataServiceApi;
  private metadataServicePromiseClient = new MetadataStoreServicePromiseClient('');

  /**
   * Factory function to return an Api instance.
   */
  public static getInstance(): Api {
    if (!Api.instance) {
      const location = window.location;
      let path = `${location.protocol}//${location.host}${location.pathname}`;
      if (path.endsWith('/')) path = path.slice(0, path.length - 1);
      Api.instance = new Api(path);
    }
    return Api.instance;
  }

  private constructor(basePath: string) {
    this.metadataServiceApi = new MetadataServiceApi({basePath});
  }

  get metadataService(): MetadataServiceApi {
    return this.metadataServiceApi;
  }

  get metadataStoreService() {
    return this.metadataServicePromiseClient;
  }
}
