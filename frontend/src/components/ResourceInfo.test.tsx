import * as React from 'react';
import {ResourceInfo} from './ResourceInfo';
import {shallow, ShallowWrapper} from 'enzyme';
import {Artifact} from '../generated/src/apis/metadata/metadata_store_pb';
import {ArtifactCustomProperties, ArtifactProperties} from '../lib/Api';
import {stringValue} from '../TestUtils';

describe('ResourceInfo', () => {
  let tree: ShallowWrapper;

  afterEach(() => tree.unmount());

  it('Renders generic Artifact information', () => {
    const dataset = new Artifact();
    dataset.setId(2);
    dataset.setTypeId(3);
    dataset.setUri('gs://my-bucket/dataset');
    dataset.getPropertiesMap().set(ArtifactProperties.NAME, stringValue('test dataset'));
    dataset.getPropertiesMap().set(ArtifactProperties.VERSION, stringValue('v0.0.1'));
    dataset.getPropertiesMap().set(ArtifactProperties.CREATE_TIME, stringValue('2019-06-12T01:21:48.259263Z'));
    dataset.getCustomPropertiesMap().set(ArtifactCustomProperties.WORKSPACE, stringValue('workspace-1'));

    tree = shallow(<ResourceInfo typeName='Data Set' resource={dataset} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders Artifact information for a Model', () => {
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
        '"training_framework": {"name": "tensorflow", "version": "v1.0"))'));
    model.getCustomPropertiesMap().set(ArtifactCustomProperties.WORKSPACE, stringValue('workspace-1'));
    model.getCustomPropertiesMap().set(ArtifactCustomProperties.RUN, stringValue('1'));

    tree = shallow(<ResourceInfo typeName='Model' resource={model} />);

    expect(tree).toMatchSnapshot();
  });
});
