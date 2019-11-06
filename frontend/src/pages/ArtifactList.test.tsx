import * as React from 'react';
import ArtifactList from './ArtifactList';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils';
import {RoutePage} from '../components/Router';
import CustomTable, {ExpandState} from '../components/CustomTable';
import {GetArtifactsResponse, GetArtifactTypesResponse} from "../generated/src/apis/metadata/metadata_store_service_pb";
import {Artifact, ArtifactType} from "../generated/src/apis/metadata/metadata_store_pb";
import {serviceError, stringValue} from '../TestUtils';

describe('ArtifactList', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifactTypes =
      jest.spyOn(Api.getInstance().metadataStoreService, 'getArtifactTypes');
  const mockGetArtifacts = jest.spyOn(Api.getInstance().metadataStoreService, 'getArtifacts');

  const fakeGetArtifactTypesResponse = new GetArtifactTypesResponse();

  const artifactType1 = new ArtifactType();
  artifactType1.setId(1);
  artifactType1.setName('kubeflow.org/alpha/metrics');
  fakeGetArtifactTypesResponse.addArtifactTypes(artifactType1);

  const artifactType2 = new ArtifactType();
  artifactType2.setId(2);
  artifactType2.setName('kubeflow.org/alpha/data_set');
  fakeGetArtifactTypesResponse.addArtifactTypes(artifactType2);

  const artifactType3 = new ArtifactType();
  artifactType3.setId(3);
  artifactType3.setName('kubeflow.org/alpha/model');
  fakeGetArtifactTypesResponse.addArtifactTypes(artifactType3);

  const fakeGetArtifactsResponse = new GetArtifactsResponse();

  const artifact1 = new Artifact();
  artifact1.setId(1);
  artifact1.setTypeId(3);
  artifact1.setUri('gs://my-bucket/mnist');
  const artifact1PropertiesMap = artifact1.getPropertiesMap();
  artifact1PropertiesMap.set('name', stringValue('model'));
  artifact1PropertiesMap.set('pipeline_name', stringValue('pipeline-1'));
  artifact1PropertiesMap.set('version', stringValue('v0'));
  artifact1PropertiesMap.set('create_time', stringValue('2019-06-12T01:21:48.259263Z'));
  fakeGetArtifactsResponse.addArtifacts(artifact1);

  const artifact2 = new Artifact();
  artifact2.setId(2);
  artifact2.setTypeId(2);
  artifact2.setUri('gs://my-bucket/dataset2');
  const artifact2PropertiesMap = artifact2.getPropertiesMap();
  artifact2PropertiesMap.set('name', stringValue('dataset'));
  artifact2PropertiesMap.set('pipeline_name', stringValue('pipeline-1'));
  artifact2PropertiesMap.set('version', stringValue('v1'));
  artifact2PropertiesMap.set('create_time', stringValue('2019-06-16T01:21:48.259263Z'));
  const artifact2CustomPropertiesMap = artifact2.getCustomPropertiesMap();
  artifact2CustomPropertiesMap.set('__kf_workspace__', stringValue('workspace-1'));
  fakeGetArtifactsResponse.addArtifacts(artifact2);

  const artifact3 = new Artifact();
  artifact3.setId(3);
  artifact3.setTypeId(2);
  artifact3.setUri('gs://my-bucket/dataset2');
  const artifact3PropertiesMap = artifact3.getPropertiesMap();
  artifact3PropertiesMap.set('name', stringValue('dataset'));
  artifact3PropertiesMap.set('pipeline_name', stringValue('pipeline-1'));
  artifact3PropertiesMap.set('version', stringValue('v2'));
  artifact3PropertiesMap.set('create_time', stringValue('2019-07-01T01:00:00.000000Z'));
  const artifact3CustomPropertiesMap = artifact3.getCustomPropertiesMap();
  artifact3CustomPropertiesMap.set('__kf_workspace__', stringValue('workspace-1'));
  fakeGetArtifactsResponse.addArtifacts(artifact3);

  const artifact4 = new Artifact();
  artifact4.setId(4);
  artifact4.setTypeId(1);
  artifact4.setUri('gcs://my-bucket/mnist-eval.csv');
  const artifact4PropertiesMap = artifact4.getPropertiesMap();
  artifact4PropertiesMap.set('create_time', stringValue('2019-06-28T01:40:11.843625Z'));
  artifact4PropertiesMap.set('data_set_id', stringValue('13'));
  artifact4PropertiesMap.set(
      'description', stringValue('validating the MNIST model to recognize handwritten digits'));
  artifact4PropertiesMap.set('metrics_type', stringValue('validation'));
  artifact4PropertiesMap.set('model_id', stringValue('1'));
  artifact4PropertiesMap.set('name', stringValue('MNIST-evaluation'));
  artifact4PropertiesMap.set('owner', stringValue('someone@kubeflow.org'));
  const artifact4CustomPropertiesMap = artifact4.getCustomPropertiesMap();
  artifact4CustomPropertiesMap.set('__kf_run__', stringValue('run-2019-06-28T01:40:11.735816'));
  artifact4CustomPropertiesMap.set('__kf_workspace__', stringValue('ws1'));
  fakeGetArtifactsResponse.addArtifacts(artifact4);

  const artifact5 = new Artifact();
  artifact5.setId(5);
  artifact5.setTypeId(3);
  artifact5.setUri('gs://my-bucket/mnist');
  const artifact5PropertiesMap = artifact5.getPropertiesMap();
  artifact5PropertiesMap.set('name', stringValue('model'));
  artifact5PropertiesMap.set('pipeline_name', stringValue('pipeline-1'));
  artifact5PropertiesMap.set('version', stringValue('v1'));
  artifact5PropertiesMap.set('create_time', stringValue('2019-07-01T00:00:00.000000Z'));
  const artifact5CustomPropertiesMap = artifact5.getCustomPropertiesMap();
  artifact5CustomPropertiesMap.set('__kf_workspace__', stringValue('workspace-1'));
  fakeGetArtifactsResponse.addArtifacts(artifact5);

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
    mockGetArtifacts.mockResolvedValue({
      error: null,
      response: fakeGetArtifactsResponse,
    });
    mockGetArtifactTypes.mockResolvedValue({
      error: null,
      response: fakeGetArtifactTypesResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Renders and applies filter to a list of Artifacts', async () => {
    mockGetArtifactTypes.mockResolvedValue({
      error: null,
      response: fakeGetArtifactTypesResponse,
    });
    mockGetArtifacts.mockResolvedValue({
      error: null,
      response: fakeGetArtifactsResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
    await TestUtils.flushPromises();
    tree.update();

    const table = tree.find(CustomTable).instance() as CustomTable;
    table.reload({filter: 'evaluation'});
    tree.update();

    expect(table.props.rows.length).toBe(1);
    expect(tree).toMatchSnapshot();
  });

  it('Renders and sorts Artifacts in ascending order by pipeline/workspace name',
    async () => {
      mockGetArtifactTypes.mockResolvedValue({
        error: null,
        response: fakeGetArtifactTypesResponse,
      });
      mockGetArtifacts.mockResolvedValue({
        error: null,
        response: fakeGetArtifactsResponse,
      });
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      table.reload({sortBy: 'pipelineName', orderAscending: true});
      tree.update();

      const rows = table.props.rows.map((r) => r.otherFields[0]);
      expect(rows).toEqual(['pipeline-1', 'ws1']);
      expect(tree).toMatchSnapshot();
    });

  it('Renders and sorts Artifacts in ascending order by id',
    async () => {
      mockGetArtifactTypes.mockResolvedValue({
        error: null,
        response: fakeGetArtifactTypesResponse,
      });
      mockGetArtifacts.mockResolvedValue({
        error: null,
        response: fakeGetArtifactsResponse,
      });
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      table.reload({sortBy: 'id', orderAscending: false});
      tree.update();

      const rows = table.props.rows.map((r) => r.otherFields[0]);
      expect(rows).toEqual(['pipeline-1', 'ws1']);
      expect(tree).toMatchSnapshot();
    });

  it('Renders and expands artifacts from pipeline-1',
    async () => {
      mockGetArtifactTypes.mockResolvedValue({
        error: null,
        response: fakeGetArtifactTypesResponse,
      });
      mockGetArtifacts.mockResolvedValue({
        error: null,
        response: fakeGetArtifactsResponse,
      });
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      const index = table.props.rows.findIndex((r) => r.otherFields[0] === 'pipeline-1');
      tree.find('IconButton.expandButton').at(index).simulate('click');
      expect(table.props.rows[index].expandState).toBe(ExpandState.EXPANDED);
      const expandedRows = tree.find('.expandedContainer CustomTableRow');
      expect(expandedRows.length).toBe(4);
      expect(expandedRows.get(0).props.row.id).toBe('kubeflow.org/alpha/model:1');
      expect(expandedRows.get(1).props.row.id).toBe('kubeflow.org/alpha/data_set:2');

      tree.find('IconButton.expandButton').at(index).simulate('click');
      expect(table.props.rows[index].expandState).toBe(ExpandState.COLLAPSED);
      expect(tree.find('.expandedContainer').exists()).toBeFalsy();
    });

  it('Renders Artifact with no grouped rows with placeholder',
    async () => {
      mockGetArtifactTypes.mockResolvedValue({
        error: null,
        response: fakeGetArtifactTypesResponse,
      });
      mockGetArtifacts.mockResolvedValue({
        error: null,
        response: fakeGetArtifactsResponse,
      });
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      const index = table.props.rows.findIndex((r) => r.otherFields[0] === 'ws1');
      expect(table.props.rows[index].expandState).toBe(ExpandState.NONE);
      expect(tree.find('.expandButtonPlaceholder').exists())
      expect(tree.find('.expandedContainer').exists()).toBeFalsy();
      expect(tree).toMatchSnapshot();
    });

  it('Shows error when artifacts cannot be retrieved', async () => {
    mockGetArtifactTypes.mockResolvedValue({
      error: null,
      response: fakeGetArtifactTypesResponse,
    });
    mockGetArtifacts.mockResolvedValue({
      error: serviceError,
      response: fakeGetArtifactsResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockGetArtifacts]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Artifacts. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });

  it('Shows error when artifact types cannot be retrieved', async () => {
    mockGetArtifacts.mockResolvedValue({
      error: null,
      response: fakeGetArtifactsResponse,
    });
    mockGetArtifactTypes.mockResolvedValue({
      error: serviceError,
      response: fakeGetArtifactTypesResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockGetArtifactTypes]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message:
        'Unable to retrieve Artifact Types, some features may not work. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
