import * as React from 'react';
import {ModelInfoProps, ModelInfo} from './ModelInfo';
import {shallow, ShallowWrapper} from 'enzyme';

describe('ModelInfo', () => {
  let tree: ShallowWrapper;
  const testProps: ModelInfoProps = {
    description: "model to recognize handwritten digits",
    version: "v0.0.1",
    createTime: "2019-06-12T01:21:48.259263Z",
    uri: "gs://my-bucket/mnist",
    workspace: "workspace1",
    run: "run123",
    hyperparameters: {
      "early_stop": true,
      "layers": [10, 3, 1],
      "learning_rate": 0.5
    },
    modelType: "neural network",
    trainingFramework: {
      name: "tensorflow",
      version: "v1.0"
    }
  };

  afterEach(() => tree.unmount());

  it('Renders Model information', () => {
    tree = shallow(<ModelInfo {...testProps} />);

    expect(tree).toMatchSnapshot();
  });
});
