import * as React from 'react';
import ModelDetails from './ModelDetails';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils'
import {RouteParams} from '../components/Router';
import {ApiListArtifactsResponse} from '../apis/service';

describe('ModelDetails', () => {
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
          description: {string_value: 'A really great model'},
          version: {string_value: 'v1'},
          create_time: {string_value: '2019-06-12T01:21:48.259263Z'},
          __ALL_META__: {
            string_value: '{"hyperparameters": {"early_stop": true, ' +
              '"layers": [10, 3, 1], "learning_rate": 0.5}, ' +
              '"model_type": "neural network", ' +
              '"training_framework": {"name": "tensorflow", "version": "v1.0"}}'
          }
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
          __kf_run__: {string_value: '1'},
        },
      },
      {
        id: "2",
        type_id: "3",
        uri: "gs://my-bucket/dataset2",
        properties: {
          name: {string_value: 'dataset'},
          description: {string_value: 'A really great dataset'},
          version: {string_value: 'v2'},
          create_time: {string_value: '2019-06-16T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
          __kf_run__: {string_value: '1'},
        },
      }
    ]
  };
  const FAKE_MODEL_ID = '1';

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ModelDetails,
      {} as any,
      {params: {[RouteParams.artifactId]: FAKE_MODEL_ID}} as any,
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

  it('Renders progress bar with no data', () => {
    tree = shallow(<ModelDetails {...generateProps()} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders with a Model and updates the page title', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    tree = TestUtils.mountWithRouter(<ModelDetails {...generateProps()} />);

    await mockListArtifacts;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
    expect(updateToolbarSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      pageTitle: 'model (version: v1)',
    }));
  });

  it('Shows error when Models cannot be retrieved', async () => {
    mockListArtifacts.mockRejectedValue(new Error('Get Model error'));
    tree = TestUtils.mountWithRouter(<ModelDetails {...generateProps()} />);

    await mockListArtifacts;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Model 1. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });

  // TODO: This can be removed once the getArtifact API method is in place
  it('Shows error when specified Model cannot be found', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    const props = generateProps();
    props.match = {params: {[RouteParams.artifactId]: '3'}} as any;
    tree = TestUtils.mountWithRouter(<ModelDetails {...props} />);

    await mockListArtifacts;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Model 3. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
