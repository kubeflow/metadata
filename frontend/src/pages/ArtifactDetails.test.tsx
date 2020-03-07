import {
  Api,
  Artifact,
  ArtifactProperties,
  ArtifactCustomProperties,
  GetArtifactsByIDResponse,
  GetEventsByArtifactIDsResponse,
  GetEventsByExecutionIDsResponse,
  GetExecutionsByIDResponse,
  GetExecutionsResponse,
  Value,
} from '@kubeflow/frontend';
import * as React from 'react';
import ArtifactDetails, {ArtifactDetailsTab, ArtifactDetailsUnmodded} from './ArtifactDetails';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {match} from 'react-router';
import * as TestUtils from '../TestUtils';
import {RouteParams} from '../components/Router';
import {Page, PageProps} from './Page';

export const stringValue = (string: String) => {	
  const value = new Value();	
  value.setStringValue(String(string));	
  return value;	
};
export const buildTestModel = () => {	
  const model = new Artifact();	
  model.setId(1);	
  model.setTypeId(1);	
  model.setUri('gs://my-bucket/mnist');	
  model.getPropertiesMap().set(ArtifactProperties.NAME, stringValue('test model'));	
  model.getPropertiesMap().set(ArtifactProperties.DESCRIPTION, stringValue('A really great model'));	
  model.getPropertiesMap().set(ArtifactProperties.VERSION, stringValue('v1'));	
  model.getPropertiesMap().set(ArtifactProperties.CREATE_TIME, stringValue('2019-06-12T01:21:48.259263Z'));	
  model.getPropertiesMap().set(ArtifactProperties.ALL_META, stringValue(	
      '{"hyperparameters": {"early_stop": true, ' +	
      '"layers": [10, 3, 1], "learning_rate": 0.5}, ' +	
      '"model_type": "neural network", ' +	
      '"training_framework": {"name": "tensorflow", "version": "v1.0"}}'));	
  model.getCustomPropertiesMap().set(ArtifactCustomProperties.WORKSPACE, stringValue('workspace-1'));	
  model.getCustomPropertiesMap().set(ArtifactCustomProperties.RUN, stringValue('1'));	
  return model;
};
export function generatePageProps(	
  // tslint:disable-next-line: variable-name
  PageElement: new (_: PageProps) => Page<any, any>, location: Location,	
  matchValue: match, historyPushSpy: jest.SpyInstance | null,	
  updateBannerSpy: jest.SpyInstance | null,	
  updateDialogSpy: jest.SpyInstance | null,	
  updateToolbarSpy: jest.SpyInstance | null,	
  updateSnackbarSpy: jest.SpyInstance | null): PageProps {	
  const pageProps = {	
    history: {push: historyPushSpy} as any,	
    location: location as any,	
    match: matchValue,	
    toolbarProps: {actions: [], breadcrumbs: [], pageTitle: ''},	
    updateBanner: updateBannerSpy as any,	
    updateDialog: updateDialogSpy as any,	
    updateSnackbar: updateSnackbarSpy as any,	
    updateToolbar: updateToolbarSpy as any,	
  } as unknown as PageProps;	
  pageProps.toolbarProps = new PageElement(pageProps).getInitialToolbarState();	
  // The toolbar spy gets called in the getInitialToolbarState method, reset	
  // it in order to simplify tests	
  if (updateToolbarSpy) {	
    updateToolbarSpy.mockReset();	
  }	
  return pageProps;	
}

export const testModel = buildTestModel();

describe('ArtifactDetails', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifact = jest.spyOn(Api.getInstance().metadataStoreService, 'getArtifactsByID');
  const mockGetEventsByArtifactIDs =
    jest.spyOn(Api.getInstance().metadataStoreService, 'getEventsByArtifactIDs');
  const mockGetExecutions =
    jest.spyOn(Api.getInstance().metadataStoreService, 'getExecutions');
  const mockGetExecutionsByID =
    jest.spyOn(Api.getInstance().metadataStoreService, 'getExecutionsByID');
  const mockGetEventsByExecutionIDs =
    jest.spyOn(Api.getInstance().metadataStoreService, 'getEventsByExecutionIDs');

  const fakeGetArtifactByIDResponse = new GetArtifactsByIDResponse();
  fakeGetArtifactByIDResponse.addArtifacts(testModel);

  const fakeGetEventsByArtifactIDsResponse = new GetEventsByArtifactIDsResponse();
  const fakeGetExecutions = new GetExecutionsResponse();
  const fakeGetExecutionsByIDResponse = new GetExecutionsByIDResponse();
  const fakeGetEventsByExecutionIDsResponse = new GetEventsByExecutionIDsResponse();

  const MODEL_TYPE = 'kubeflow.org/alpha/model';
  const FAKE_MODEL_ID = '1';

  function generateProps(): PageProps {
    return generatePageProps(
      ArtifactDetailsUnmodded,
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
    mockGetEventsByArtifactIDs.mockResolvedValue(fakeGetEventsByArtifactIDsResponse);
    mockGetExecutions.mockResolvedValue(fakeGetExecutions);
    mockGetExecutionsByID.mockResolvedValue(fakeGetExecutionsByIDResponse)
    mockGetEventsByExecutionIDs.mockResolvedValue(fakeGetEventsByExecutionIDsResponse);

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
