import * as React from 'react';
import ArtifactList from './ArtifactList';
import {PageProps} from './Page';
import {shallow, ShallowWrapper, ReactWrapper} from 'enzyme';
import {Api} from '../lib/Api';
import * as TestUtils from '../TestUtils';
import {RoutePage} from '../components/Router';
import {ApiListArtifactsResponse, ApiListArtifactTypesResponse} from '../apis/service';
import CustomTable from '../components/CustomTable';

describe('ArtifactList', () => {
  let tree: ShallowWrapper | ReactWrapper;
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const mockListArtifactTypes = jest.spyOn(
    Api.getInstance().metadataService, 'listArtifactTypes');
  const mockListArtifacts = jest.spyOn(
    Api.getInstance().metadataService, 'listArtifacts2');
  const fakeArtifactTypesResponse: ApiListArtifactTypesResponse = {
    artifact_types: [
      {
        id: '1',
        name: 'kubeflow.org/alpha/metrics',
      },
      {
        id: '2',
        name: 'kubeflow.org/alpha/data_set',
      },
      {
        id: '3',
        name: 'kubeflow.org/alpha/model',
      },
    ]
  };
  const fakeArtifactsResponse: ApiListArtifactsResponse = {
    artifacts: [
      {
        id: '1',
        type_id: '3',
        uri: 'gs://my-bucket/mnist',
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
        id: '2',
        type_id: '2',
        uri: 'gs://my-bucket/dataset2',
        properties: {
          name: {string_value: 'dataset'},
          version: {string_value: 'v2'},
          create_time: {string_value: '2019-06-16T01:21:48.259263Z'},
        },
        custom_properties: {
          __kf_workspace__: {string_value: 'workspace-1'},
        },
      },
      {
        id: '3',
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
    mockListArtifactTypes.mockResolvedValue(fakeArtifactTypesResponse);
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockListArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('Renders and applies filter to a list of Artifacts', async () => {
    mockListArtifactTypes.mockResolvedValue(fakeArtifactTypesResponse);
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockListArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    tree.update();

    const table = tree.find(CustomTable).instance() as CustomTable;
    table.reload({filter: 'evaluation'});
    tree.update();

    expect(table.props.rows.length).toBe(1);
    expect(tree).toMatchSnapshot();
  });

  it('Renders and sorts Artifacts in descending order by created_at',
    async () => {
      mockListArtifactTypes.mockResolvedValue(fakeArtifactTypesResponse);
      mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
      tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

      await Promise.all([mockListArtifactTypes, mockListArtifacts]);
      await TestUtils.flushPromises();
      tree.update();

      const table = tree.find(CustomTable).instance() as CustomTable;
      table.reload({sortBy: 'created_at', orderAscending: false});
      tree.update();

      const rows = table.props.rows.map((r) => r.otherFields[0]);
      expect(rows).toEqual(['MNIST-evaluation', 'dataset', 'model']);
      expect(tree).toMatchSnapshot();
    });

  it('Shows error when artifacts cannot be retrieved', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    mockListArtifacts.mockRejectedValue(new Error('List artifacts error'));
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockListArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unable to retrieve Artifacts. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });

  it('Shows error when artifact types cannot be retrieved', async () => {
    mockListArtifacts.mockResolvedValue(fakeArtifactsResponse);
    mockListArtifactTypes.mockRejectedValue(
      new Error('List artifact types error'));
    tree = TestUtils.mountWithRouter(<ArtifactList {...generateProps()} />);

    await Promise.all([mockListArtifactTypes, mockListArtifacts]);
    await TestUtils.flushPromises();
    expect(updateBannerSpy).toHaveBeenCalledWith(expect.objectContaining({
      message:
        'Unable to retrieve Artifact Types, some features may not work. ' +
        'Click Details for more information.',
      mode: 'error',
    }));
  });
});
