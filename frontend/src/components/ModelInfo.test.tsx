import * as React from 'react';
import {ModelInfo} from './ModelInfo';
import {shallow, ShallowWrapper} from 'enzyme';
import {buildTestModel, stringValue, testModel} from '../TestUtils';
import {ArtifactProperties} from '../lib/Api';

describe('ModelInfo', () => {
  let tree: ShallowWrapper;

  const consoleErrorSpy = jest.spyOn(console, 'error')
    .mockImplementation(() => null);

  afterEach(() => tree.unmount());

  it('Renders Model information', () => {
    tree = shallow(<ModelInfo model={testModel} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders Model information with missing __ALL_META__ property', () => {
    const model = buildTestModel();
    model.getPropertiesMap().del(ArtifactProperties.ALL_META);

    tree = shallow(<ModelInfo model={model} />);

    expect(tree).toMatchSnapshot();
  });

  it('Renders Model information with malformed __ALL_META__ property', () => {
    const model = buildTestModel();
    model.getPropertiesMap().set(ArtifactProperties.ALL_META, stringValue('non-JSON string'));

    tree = shallow(<ModelInfo model={model} />);

    expect(tree).toMatchSnapshot();
    expect(consoleErrorSpy.mock.calls[0][0]).toBe(
      'Unable to parse __ALL_META__ property');
  });
});
