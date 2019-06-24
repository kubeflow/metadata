import {MetadataServiceApi} from '../apis/service';
import {Api} from './Api';

jest.mock('../apis/service', () => ({MetadataServiceApi: jest.fn()}));

describe('Api', () => {
  it('Returns a singleton instance with the current path as basepath', () => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      protocol: 'https:',
      host: 'metadata-server',
      pathname: '/metadata-path/',
    } as Location);

    const api = Api.getInstance();
    expect(MetadataServiceApi).toBeCalledWith({
      basePath: 'https://metadata-server/metadata-path'
    });
    expect(api).toBeInstanceOf(Api);
    expect(api.metadataService).toBeInstanceOf(MetadataServiceApi);
    expect(api).toBe(Api.getInstance());
  });
});
