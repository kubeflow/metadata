import * as React from 'react';
import ArtifactList from './ArtifactList';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils';
import {RoutePage} from '../components/Router';
import {ApiListArtifactsResponse} from '../apis/service';
import CustomTable, {ExpandState} from '../components/CustomTable';
import {GetArtifactTypesResponse} from "../generated/src/apis/metadata/metadata_store_service_pb";
import {ArtifactType} from "../generated/src/apis/metadata/metadata_store_pb";
import {grpc} from "@improbable-eng/grpc-web";

describe('ArtifactList', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockGetArtifactTypes = jest.spyOn(
    Api.getInstance().metadataStoreService, 'getArtifactTypes');
  const mockListArtifacts = jest.spyOn(
    Api.getInstance().metadataService, 'listArtifacts2');

  const fakeGetArtifactTypesResponse: GetArtifactTypesResponse = new GetArtifactTypesResponse();

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

  const fakeArtifactsResponse: ApiListArtifactsResponse = {
    artifacts: [
      {
        id: '1',
        type_id: '3',
        uri: 'gs://my-bucket/mnist',
        properties: {
          name: {string_value: 'model'},
          pipeline_name: {string_value: 'pipeline-1'},
          version: {string_value: 'v0'},
          create_time: {string_value: '2019-06-12T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
      {
        id: '2',
        type_id: '2',
        uri: 'gs://my-bucket/dataset2',
        properties: {
          name: {string_value: 'dataset'},
          pipeline_name: {string_value: 'pipeline-1'},
          version: {string_value: 'v1'},
          create_time: {string_value: '2019-06-16T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
      {
        id: '3',
        type_id: '2',
        uri: 'gs://my-bucket/dataset2',
        properties: {
          name: {string_value: 'dataset'},
          pipeline_name: {string_value: 'pipeline-1'},
          version: {string_value: 'v2'},
          create_time: {string_value: '2019-07-01T01:00:00.000000Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
      {
        id: '4',
        type_id: '1',
        uri: 'gcs://my-bucket/mnist-eval.csv',
        properties: {
          create_time: {string_value: '2019-06-28T01:40:11.843625Z'},
          data_set_id: {string_value: '13'},
          description: {
            string_value:
              'validating the MNIST model to recognize handwritten digits'
          },
          metrics_type: {string_value: 'validation'},
          model_id: {string_value: '1'},
          name: {string_value: 'MNIST-evaluation'},
          owner: {string_value: 'someone@kubeflow.org'}
        },
        custom_properties: {
          __kf_run__: {string_value: 'run-2019-06-28T01:40:11.735816'},
          __kf_workspace__: {string_value: 'ws1'}
        }
      },
      {
        id: '5',
        type_id: '3',
        uri: 'gs://my-bucket/mnist',
        properties: {
          name: {string_value: 'model'},
          pipeline_name: {string_value: 'pipeline-1'},
          version: {string_value: 'v1'},
          create_time: {string_value: '2019-07-01T00:00:00.000000Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
    ]
  };

const serviceError = {
  code: 0,
  message: '',
  metadata: new grpc.Metadata()
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
    mockGetArtifactTypes.mockResolvedValue({
        error: null,
        response: fakeGetArtifactTypesResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Renders and applies filter to a list of Artifacts', async () => {
    mockGetArtifactTypes.mockResolvedValue({
      error: null,
      response: fakeGetArtifactTypesResponse,
    });
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
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
      mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
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
      mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
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
      mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      const index = table.props.rows
        .findIndex((r) => r.otherFields[0] === 'pipeline-1');
      tree.find('IconButton.expandButton').at(index).simulate('click');
      expect(table.props.rows[index].expandState).toBe(ExpandState.EXPANDED);
      const expandedRows = tree.find('.expandedContainer CustomTableRow');
      expect(expandedRows.length).toBe(4);
      expect(expandedRows.get(0).props.row.id)
        .toBe('kubeflow.org/alpha/model:1');
      expect(expandedRows.get(1).props.row.id)
        .toBe('kubeflow.org/alpha/data_set:2');

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
      mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
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
    mockListArtifacts.mockRejectedValue(new Error('List artifacts error'));
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Artifacts. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });

  it('Shows error when artifact types cannot be retrieved', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    mockGetArtifactTypes.mockResolvedValue({
      error: serviceError,
      response: fakeGetArtifactTypesResponse,
    });
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockGetArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message:
        'Unable to retrieve Artifact Types, some features may not work. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
