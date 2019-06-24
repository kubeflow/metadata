import * as React from 'react';
import ArtifactList from './ArtifactList';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils'
import {RoutePage} from '../components/Router';
import {ApiListArtifactsResponse} from '../apis/service';

describe('ArtifactList', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockListArtifacts = jest.spyOn(
    Api.getInstance().metadataService, 'listArtifacts2');
  const fakeArtifactsResponse: ApiListArtifactsResponse = {
    artifacts: [
      {
        id: "1",
        type_id: "1",
        uri: "gs://my-bucket/mnist",
        properties: {
          name: {string_value: 'model'},
          version: {string_value: 'v1'},
          create_time: {string_value: '2019-06-12T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
      {
        id: "2",
        type_id: "3",
        uri: "gs://my-bucket/dataset2",
        properties: {
          name: {string_value: 'dataset'},
          version: {string_value: 'v2'},
          create_time: {string_value: '2019-06-16T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      }
    ]
  };

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ArtifactList,
      {pathname: RoutePage.ARTIFACTS} as any,
      '' as any,
      historyPushSpy,
      updateBannerSpy,
      jest.fn(),
      updateToolbarSpy,
      jest.fn());
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => tree.unmount());

  it('Renders with no data', () => {
    tree = shallow(<ArtifactList {...generateProps()} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders with a list of Artifacts', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await mockListArtifacts;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Shows error when artifacts cannot be retrieved', async () => {
    mockListArtifacts.mockRejectedValue(new Error('List artifacts error'));
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await mockListArtifacts;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Metadata artifacts. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
