import {MetadataServiceApi} from '../apis/service';

/** Known custom properties */
export enum CustomProperties {
  ALL_META = '__ALL_META__',
  WORKSPACE = '__kf_workspace__',
  RUN = '__kf_run__',
}

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
}
