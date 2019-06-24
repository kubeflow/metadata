import * as React from 'react';
import ModelDetails from './ModelDetails';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils'
import {RouteParams} from '../components/Router';
import {ApiListArtifactsResponse, ApiGetArtifactResponse} from '../apis/service';

describe('ModelDetails', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifact = jest.spyOn(
    Api.getInstance().metadataService, 'getArtifact');
  const fakeArtifactResponse: ApiGetArtifactResponse = {
    artifact:
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
    }
  };
  const MODEL_TYPE = 'kubeflow.org/alpha/model'
  const FAKE_MODEL_ID = '1';

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ModelDetails,
      {} as any,
      {
        params: {
          [RouteParams.ARTIFACT_TYPE]: MODEL_TYPE,
          [RouteParams.ID]: FAKE_MODEL_ID
        }
      } as any,
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
    mockGetArtifact.mockResolvedValue(fakeArtifactResponse);
    tree = TestUtils.mountWithRouter(<ModelDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
    expect(updateToolbarSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      pageTitle: 'model (version: v1)',
    }));
  });

  it('Shows error when Models cannot be retrieved', async () => {
    mockGetArtifact.mockRejectedValue(new Error('Get Model error'));
    tree = TestUtils.mountWithRouter(<ModelDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Model 1. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
