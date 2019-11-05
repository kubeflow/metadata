import * as React from 'react';
import ArtifactDetails, {ArtifactDetailsTab} from './ArtifactDetails';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api, ArtifactCustomProperties, ArtifactProperties} from '../lib/Api';
import * as TestUtils from '../TestUtils'
import {RouteParams} from '../components/Router';
import {serviceError, stringValue} from '../TestUtils';
import {GetArtifactsByIDResponse} from '../generated/src/apis/metadata/metadata_store_service_pb';
import {Artifact} from '../generated/src/apis/metadata/metadata_store_pb';

describe('ArtifactDetails', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifact = jest.spyOn(Api.getInstance().metadataStoreService, 'getArtifactsByID');
  const fakeGetArtifactByIDResponse = new GetArtifactsByIDResponse();
  const artifact = new Artifact();
  artifact.setId(1);
  artifact.setTypeId(1);
  artifact.setUri('gs://my-bucket/mnist');
  artifact.getPropertiesMap().set(ArtifactProperties.NAME, stringValue('test model'));
  artifact.getPropertiesMap().set(ArtifactProperties.DESCRIPTION, stringValue('A really great model'));
  artifact.getPropertiesMap().set(ArtifactProperties.VERSION, stringValue('v1'));
  artifact.getPropertiesMap().set(ArtifactProperties.CREATE_TIME, stringValue('2019-06-12T01:21:48.259263Z'));
  artifact.getPropertiesMap().set(ArtifactProperties.ALL_META, stringValue(
      '{"hyperparameters": {"early_stop": true, ' +
      '"layers": [10, 3, 1], "learning_rate": 0.5}, ' +
      '"model_type": "neural network", ' +
      '"training_framework": {"name": "tensorflow", "version": "v1.0"))'));
  artifact.getCustomPropertiesMap().set(ArtifactCustomProperties.WORKSPACE, stringValue('workspace-1'));
  artifact.getCustomPropertiesMap().set(ArtifactCustomProperties.RUN, stringValue('1'));
  fakeGetArtifactByIDResponse.addArtifacts(artifact);

  const MODEL_TYPE = 'kubeflow.org/alpha/model';
  const FAKE_MODEL_ID = '1';

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ArtifactDetails,
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
    tree = shallow(<ArtifactDetails {...generateProps()} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders with a Model Artifact and updates the page title', async () => {
    mockGetArtifact.mockResolvedValue({
      error: null,
      response: fakeGetArtifactByIDResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
    expect(updateToolbarSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      pageTitle: 'test model (version: v1)',
    }));
  });

  it('Shows error when returned Artifact is empty', async () => {
    mockGetArtifact.mockResolvedValue({
      error: null,
      response: new GetArtifactsByIDResponse(),
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'No kubeflow.org/alpha/model identified by id: 1',
      mode: 'error',
    }));
  });

  it('Shows error when Artifact cannot be retrieved', async () => {
    mockGetArtifact.mockResolvedValue({
      error: serviceError,
      response: fakeGetArtifactByIDResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve kubeflow.org/alpha/model 1. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });

  it('Renders the Overview tab for an artifact', async () => {
    mockGetArtifact.mockResolvedValue({
      error: null,
      response: fakeGetArtifactByIDResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);
    tree.setState({
      selectedTab: ArtifactDetailsTab.OVERVIEW
    });

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Renders the Lineage Explorer tab for an artifact', async () => {
    mockGetArtifact.mockResolvedValue({
      error: null,
      response: fakeGetArtifactByIDResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);
    tree.setState({
      selectedTab: ArtifactDetailsTab.LINEAGE_EXPLORER
    });

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Renders the Deployments tab for an artifact', async () => {
    mockGetArtifact.mockResolvedValue({
      error: null,
      response: fakeGetArtifactByIDResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);
    tree.setState({
      selectedTab: ArtifactDetailsTab.DEPLOYMENTS
    });

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });
});
