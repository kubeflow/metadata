import * as React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import {LineageActionBar} from "./LineageActionBar";
import {testModel} from "../TestUtils";

describe('LineageActionBar', () => {
  let tree: ShallowWrapper;

  afterEach(() => tree.unmount());

  it('Renders correctly for a given root id', () => {
    tree = shallow(<LineageActionBar initialTarget={testModel} setLineageViewTarget={jest.fn()} />);
    expect(tree).toMatchSnapshot();
  });
});
