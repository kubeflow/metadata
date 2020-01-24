import {Artifact, ArtifactCustomProperties, ArtifactProperties} from 'frontend';
import * as React from 'react';
import {ResourceInfo} from './ResourceInfo';
import {shallow, ShallowWrapper} from 'enzyme';
import {stringValue, testModel} from '../TestUtils';

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
    tree = shallow(<ResourceInfo typeName='Model' resource={testModel} />);
    expect(tree).toMatchSnapshot();
  });
});
