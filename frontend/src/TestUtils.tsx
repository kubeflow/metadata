/*
 * Copyright 2018 Google LLC
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

/* eslint-disable */
// tslint:disable: object-literal-sort-keys

// Because this is test utils.

import * as React from 'react';
// @ts-ignore
import createRouterContext from 'react-router-test-context';
import {PageProps, Page} from './pages/Page';
import {ToolbarActionConfig} from './components/Toolbar';
import {match} from 'react-router';
import {mount, ReactWrapper} from 'enzyme';
import {object} from 'prop-types';
import {format} from 'prettier';
import snapshotDiff from 'snapshot-diff';
import {
  Artifact,
  ArtifactProperties,
  ArtifactCustomProperties,
  Value,
} from '@kubeflow/frontend';

export default class TestUtils {
  /**
   * Mounts the given component with a fake router and returns the mounted tree
   */
  // tslint:disable-next-line:variable-name
  public static mountWithRouter(component: React.ReactElement<any>): ReactWrapper {
    const childContextTypes = {
      router: object,
    };
    const context = createRouterContext();
    const tree = mount(component, { context, childContextTypes });
    return tree;
  }

  /**
   * Flushes all already queued promises and returns a promise. Note this will
   * only work if the promises have already been queued, so it cannot be used to
   * wait on a promise that hasn't been dispatched yet.
   */
  public static flushPromises(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
  }

  /**
   * Adds a one-time mock implementation to the provided spy that mimics an error
   * network response
   */
  public static makeErrorResponseOnce(spy: jest.MockInstance<unknown, unknown[]>, message: string): void {
    spy.mockImplementationOnce(() => {
      throw {
        text: () => Promise.resolve(message),
      };
    });
  }

  /**
   * Generates a customizable PageProps object that can be passed to initialize
   * Page components, taking care of setting ToolbarProps properly, which have
   * to be set after component initialization.
   */
  // tslint:disable-next-line:variable-name
  public static generatePageProps(
    PageElement: new (_: PageProps) => Page<any, any>,
    location: Location,
    matchValue: match,
    historyPushSpy: jest.SpyInstance<unknown> | null,
    updateBannerSpy: jest.SpyInstance<unknown> | null,
    updateDialogSpy: jest.SpyInstance<unknown> | null,
    updateToolbarSpy: jest.SpyInstance<unknown> | null,
    updateSnackbarSpy: jest.SpyInstance<unknown> | null,
  ): PageProps {
    const pageProps = {
      history: { push: historyPushSpy } as any,
      location: location as any,
      match: matchValue,
      toolbarProps: { actions: {}, breadcrumbs: [], pageTitle: '' },
      updateBanner: updateBannerSpy as any,
      updateDialog: updateDialogSpy as any,
      updateSnackbar: updateSnackbarSpy as any,
      updateToolbar: updateToolbarSpy as any,
    } as PageProps;
    pageProps.toolbarProps = new PageElement(pageProps).getInitialToolbarState();
    // The toolbar spy gets called in the getInitialToolbarState method, reset it
    // in order to simplify tests
    if (updateToolbarSpy) {
      updateToolbarSpy.mockReset();
    }
    return pageProps;
  }

  public static getToolbarButton(
    updateToolbarSpy: jest.SpyInstance<unknown>,
    buttonKey: string,
  ): ToolbarActionConfig {
    const lastCallIdx = updateToolbarSpy.mock.calls.length - 1;
    const lastCall = updateToolbarSpy.mock.calls[lastCallIdx][0];
    return lastCall.actions[buttonKey];
  }
}

/**
 * Generate diff text for two HTML strings.
 * Recommend providing base and update annotations to clarify context in the diff directly.
 */
export function diffHTML({
  base,
  update,
  baseAnnotation,
  updateAnnotation,
}: {
  base: string;
  baseAnnotation?: string;
  update: string;
  updateAnnotation?: string;
}) {
  return diff({
    base: formatHTML(base),
    update: formatHTML(update),
    baseAnnotation,
    updateAnnotation,
  });
}

export function diff({
  base,
  update,
  baseAnnotation,
  updateAnnotation,
}: {
  base: string;
  baseAnnotation?: string;
  update: string;
  updateAnnotation?: string;
}) {
  return snapshotDiff(base, update, {
    stablePatchmarks: true, // Avoid line numbers in diff, so that diffs are stable against irrelevant changes
    aAnnotation: baseAnnotation,
    bAnnotation: updateAnnotation,
  });
}

function formatHTML(html: string): string {
  return format(html, { parser: 'html' });
}

/**	
 * Generates a customizable PageProps object that can be passed to initialize	
 * Page components, taking care of setting ToolbarProps properly, which have	
 * to be set after component initialization.	
 */	
// tslint:disable-next-line:variable-name	
export function generatePageProps(	
  // tslint:disable-next-line: variable-name
  PageElement: new (_: PageProps) => Page<any, any>, location: Location,	
  matchValue: match, historyPushSpy: jest.SpyInstance | null,	
  updateBannerSpy: jest.SpyInstance | null,	
  updateDialogSpy: jest.SpyInstance | null,	
  updateToolbarSpy: jest.SpyInstance | null,	
  updateSnackbarSpy: jest.SpyInstance | null): PageProps {	
  const pageProps = {	
    history: {push: historyPushSpy} as any,	
    location: location as any,	
    match: matchValue,	
    toolbarProps: {actions: [], breadcrumbs: [], pageTitle: ''},	
    updateBanner: updateBannerSpy as any,	
    updateDialog: updateDialogSpy as any,	
    updateSnackbar: updateSnackbarSpy as any,	
    updateToolbar: updateToolbarSpy as any,	
  } as unknown as PageProps;	
  pageProps.toolbarProps = new PageElement(pageProps).getInitialToolbarState();	
  // The toolbar spy gets called in the getInitialToolbarState method, reset	
  // it in order to simplify tests	
  if (updateToolbarSpy) {	
    updateToolbarSpy.mockReset();	
  }	
  return pageProps;	
}	

export function getToolbarButton(	
  updateToolbarSpy: jest.SpyInstance, title: string): ToolbarActionConfig {	
  const lastCallIdx = updateToolbarSpy.mock.calls.length - 1;	
  const lastCall = updateToolbarSpy.mock.calls[lastCallIdx][0];	
  return lastCall.actions.find((b: any) => b.title === title);	
}	

export const doubleValue = (number: number) => {	
  const value = new Value();	
  value.setDoubleValue(number);	
  return value;	
};	

export const intValue = (number: number) => {	
  const value = new Value();	
  value.setIntValue(number);	
  return value;	
};	

export const stringValue = (string: String) => {	
  const value = new Value();	
  value.setStringValue(String(string));	
  return value;	
};	

export const buildTestModel = () => {	
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
      '"training_framework": {"name": "tensorflow", "version": "v1.0"}}'));	
  model.getCustomPropertiesMap().set(ArtifactCustomProperties.WORKSPACE, stringValue('workspace-1'));	
  model.getCustomPropertiesMap().set(ArtifactCustomProperties.RUN, stringValue('1'));	
  return model	
};	

export const testModel = buildTestModel();