import {MetadataServiceApi} from '../apis/service';

/**
 * Class to wrap backend APIs.
 */
export class Api {
  private metadataServiceApi: MetadataServiceApi;

  constructor(basePath: string) {
    this.metadataServiceApi = new MetadataServiceApi({basePath});
  }

  get metadataService(): MetadataServiceApi {
    return this.metadataServiceApi;
  }
}

let apiSingleton: Api;
/**
 * Factory function to return an Api instance.
 */
export function getApi(): Api {
  if (!apiSingleton) {
    const location = window.location;
    let path = `${location.protocol}//${location.host}${location.pathname}`;
    if (path.endsWith('/')) path = path.slice(0, path.length - 1);
    apiSingleton = new Api(path);
  }
  return apiSingleton;
}
