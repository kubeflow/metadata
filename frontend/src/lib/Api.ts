import {MetadataServiceApi} from '../apis/service';
import {
  MetadataStoreServiceClient,
  ServiceError, UnaryResponse
} from "../generated/src/apis/metadata/metadata_store_service_pb_service";

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

type Callback<R> = (err: ServiceError | null, res: R | null) => void;
type MetadataApiMethod<T, R> = (request: T, callback: Callback<R>) => UnaryResponse;
type PromiseBasedMetadataApiMethod<T, R> = (request: T) => Promise<{ response: R | null, error: ServiceError | null }>;

/**
 * Converts a callback based api method to promise based api method.
 */
function makePromiseApi<T, R>(apiMethod: MetadataApiMethod<T, R>): PromiseBasedMetadataApiMethod<T, R> {
  return (request: T) => new Promise((resolve, reject) => {
    const handler = (error: ServiceError | null, response: R | null) => {
      // resolve both response and error to keep type information
      resolve({ response, error });
    };
    apiMethod(request, handler);
  });
}

const metadataServiceClient = new MetadataStoreServiceClient('');

// TODO: add all other api methods we need here.
const metadataServicePromiseClient = {
  getArtifactTypes: makePromiseApi(metadataServiceClient.getArtifactTypes.bind(metadataServiceClient)),
  getArtifacts: makePromiseApi(metadataServiceClient.getArtifacts.bind(metadataServiceClient)),
  getArtifactsByID: makePromiseApi(metadataServiceClient.getArtifactsByID.bind(metadataServiceClient)),
  getExecutionsByID: makePromiseApi(metadataServiceClient.getExecutionsByID.bind(metadataServiceClient)),
};

/**
 * Class to wrap backend APIs.
 */
export class Api {

  private static instance: Api;
  private metadataServiceApi: MetadataServiceApi;

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
    return metadataServicePromiseClient;
  }
}
