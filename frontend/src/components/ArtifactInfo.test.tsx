import * as React from 'react';
import {ArtifactInfo} from './ArtifactInfo';
import {shallow, ShallowWrapper} from 'enzyme';
import {MlMetadataArtifact} from '../apis/service';

describe('ArtifactInfo', () => {
  let tree: ShallowWrapper;

  afterEach(() => tree.unmount());

  it('Renders generic Artifact information', () => {
    const dataset: MlMetadataArtifact = {
      id: '2',
      type_id: '3',
      uri: 'gs://my-bucket/dataset',
      properties: {
        name: {string_value: 'test dataset'},
        version: {string_value: 'v0.0.1'},
        create_time: {string_value: '2019-06-12T01:21:48.259263Z'},
      },
      custom_properties: {
        __kf_workspace__: {string_value: 'workspace-1'},
      },
    };
    tree = shallow(<ArtifactInfo typeName='Data Set' artifact={dataset} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders Artifact information for a Model', () => {
    const model: MlMetadataArtifact = {
      id: '1',
      type_id: '1',
      uri: 'gs://my-bucket/mnist',
      properties: {
        name: {string_value: 'test model'},
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
    };
    tree = shallow(<ArtifactInfo typeName='Model' artifact={model} />);

    expect(tree).toMatchSnapshot();
  });
});
