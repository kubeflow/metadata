import * as React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import {LineageActionBar} from "./LineageActionBar";

describe('LineageActionBar', () => {
  let tree: ShallowWrapper;

  afterEach(() => tree.unmount());

  it('Renders correctly for a given root id', () => {
    tree = shallow(<LineageActionBar root={'artifactId'} />);
    expect(tree).toMatchSnapshot();
  });
});
