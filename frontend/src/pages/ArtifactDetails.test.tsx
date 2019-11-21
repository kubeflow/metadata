import * as React from 'react';
import ArtifactDetails, {ArtifactDetailsTab} from './ArtifactDetails';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils'
import {RouteParams} from '../components/Router';
import {testModel} from '../TestUtils';
import {GetArtifactsByIDResponse} from '../generated/src/apis/metadata/metadata_store_service_pb';

describe('ArtifactDetails', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifact = jest.spyOn(Api.getInstance().metadataStoreService, 'getArtifactsByID');
  const fakeGetArtifactByIDResponse = new GetArtifactsByIDResponse();
  fakeGetArtifactByIDResponse.addArtifacts(testModel);

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
    mockGetArtifact.mockResolvedValue(fakeGetArtifactByIDResponse);
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
    mockGetArtifact.mockResolvedValue(new GetArtifactsByIDResponse());
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'No kubeflow.org/alpha/model identified by id: 1',
      mode: 'error',
    }));
  });

  it('Shows error when Artifact cannot be retrieved', async () => {
    // @ts-ignore
    mockGetArtifact.mockResolvedValue();
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);

    await mockGetArtifact;
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve kubeflow.org/alpha/model 1.',
      mode: 'error',
    }));
  });

  it('Renders the Overview tab for an artifact', async () => {
    mockGetArtifact.mockResolvedValue(fakeGetArtifactByIDResponse);
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
    mockGetArtifact.mockResolvedValue(fakeGetArtifactByIDResponse);
    tree = TestUtils.mountWithRouter(<ArtifactDetails {...generateProps()} />);
    tree.setState({
      selectedTab: ArtifactDetailsTab.LINEAGE_EXPLORER
    });

    await mockGetArtifact;
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });
});
