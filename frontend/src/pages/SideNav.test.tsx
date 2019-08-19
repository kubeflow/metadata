/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';

import SideNav, { css } from './SideNav';
import { LocalStorage } from '../lib/LocalStorage';
import { ReactWrapper, ShallowWrapper, shallow, } from 'enzyme';
import { RouterProps } from 'react-router';
import { RoutePage } from '../components/Router';

const wideWidth = 1000;
const narrowWidth = 200;
const isCollapsed = (tree: ShallowWrapper<any>) =>
  tree.find('WithStyles(IconButton)').hasClass(css.collapsedChevron);
const routerProps: RouterProps = { history: {} as any };

describe('SideNav', () => {
  let tree: ReactWrapper | ShallowWrapper;

  const consoleErrorSpy = jest.spyOn(console, 'error');
  const localStorageHasKeySpy = jest.spyOn(LocalStorage, 'hasKey');
  const localStorageIsCollapsedSpy = jest.spyOn(LocalStorage, 'isNavbarCollapsed');

  beforeEach(() => {
    jest.clearAllMocks();

    consoleErrorSpy.mockImplementation(() => null);

    localStorageHasKeySpy.mockImplementation(() => false);
    localStorageIsCollapsedSpy.mockImplementation(() => false);
  });

  afterEach(async () => {
    // unmount() should be called before resetAllMocks() in case any part of the unmount life cycle
    // depends on mocks/spies
    await tree.unmount();
    jest.resetAllMocks();
    (window as any).innerWidth = wideWidth;
  });

  it('renders expanded state', () => {
    localStorageHasKeySpy.mockImplementationOnce(() => false);
    (window as any).innerWidth = wideWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders collapsed state', () => {
    localStorageHasKeySpy.mockImplementationOnce(() => false);
    (window as any).innerWidth = narrowWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders artifacts as active page', () => {
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders artifacts as active when on ArtifactsDetails page', () => {
    tree = shallow(<SideNav page={RoutePage.ARTIFACT_DETAILS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders executions as active page', () => {
    tree = shallow(<SideNav page={RoutePage.EXECUTIONS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders executions as active when on ExecutionDetails page', () => {
    tree = shallow(<SideNav page={RoutePage.EXECUTION_DETAILS} {...routerProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('collapses if collapse state is true localStorage', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => true);
    localStorageHasKeySpy.mockImplementationOnce(() => true);

    (window as any).innerWidth = wideWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(true);
  });

  it('expands if collapse state is false in localStorage', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => true);

    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(false);
  });

  it('collapses if no collapse state in localStorage, and window is too narrow', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => false);

    (window as any).innerWidth = narrowWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(true);
  });

  it('expands if no collapse state in localStorage, and window is wide', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => false);

    (window as any).innerWidth = wideWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(false);
  });

  it('collapses if no collapse state in localStorage, and window goes from wide to narrow', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => false);

    (window as any).innerWidth = wideWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(false);

    (window as any).innerWidth = narrowWidth;
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    expect(isCollapsed(tree)).toBe(true);
  });

  it('expands if no collapse state in localStorage, and window goes from narrow to wide', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => false);

    (window as any).innerWidth = narrowWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(true);

    (window as any).innerWidth = wideWidth;
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    expect(isCollapsed(tree)).toBe(false);
  });

  it('saves state in localStorage if chevron is clicked', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => false);
    const spy = jest.spyOn(LocalStorage, 'saveNavbarCollapsed');

    (window as any).innerWidth = narrowWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(true);

    tree.find('WithStyles(IconButton)').simulate('click');
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('does not collapse if collapse state is saved in localStorage, and window resizes', () => {
    localStorageIsCollapsedSpy.mockImplementationOnce(() => false);
    localStorageHasKeySpy.mockImplementationOnce(() => true);

    (window as any).innerWidth = wideWidth;
    tree = shallow(<SideNav page={RoutePage.ARTIFACTS} {...routerProps} />);
    expect(isCollapsed(tree)).toBe(false);

    (window as any).innerWidth = narrowWidth;
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    expect(isCollapsed(tree)).toBe(false);
  });
});
