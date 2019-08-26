/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { Page } from './Page';
import { ToolbarProps } from '../components/Toolbar';
import { RoutePage, RouteParams } from '../components/Router';
import { Api, ExecutionProperties } from '../lib/Api';
import { MlMetadataExecution } from '../apis/service';
import { classes } from 'typestyle';
import { commonCss, padding } from '../Css';
import { CircularProgress } from '@material-ui/core';
import { titleCase, getResourceProperty } from '../lib/Utils';
import { ResourceInfo } from '../components/ResourceInfo';

interface ExecutionDetailsState {
  execution?: MlMetadataExecution;
}

export default class ExecutionDetails extends Page<{}, ExecutionDetailsState> {
  private api = Api.getInstance();

  constructor(props: {}) {
    super(props);
    this.state = {};
    this.load = this.load.bind(this);
  }

  private get fullTypeName(): string {
    return this.props.match.params[RouteParams.EXECUTION_TYPE] || '';
  }

  private get properTypeName(): string {
    const parts = this.fullTypeName.split('/');
    if (!parts.length) return '';

    return titleCase(parts[parts.length - 1]);
  }

  private get id(): string {
    return this.props.match.params[RouteParams.ID];
  }

  public async componentDidMount(): Promise<void> {
    return this.load();
  }

  public render(): JSX.Element {
    if (!this.state.execution) return <CircularProgress />;
    return (
      <div className={classes(commonCss.page, padding(20, 'lr'))}>
        {<ResourceInfo typeName={this.properTypeName}
          resource={this.state.execution} />}
      </div >
    );
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [{ displayName: 'Executions', href: RoutePage.EXECUTIONS }],
      pageTitle: `${this.properTypeName} ${this.id} details`
    };
  }

  public async refresh(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    try {
      const { execution } = await this.api.metadataService.getExecution(this.id, this.fullTypeName);
      if (!execution) {
        throw new Error(
          `No ${this.fullTypeName} identified by id: ${this.id}`);
      }

      const executionName = getResourceProperty(execution, ExecutionProperties.NAME);
      this.props.updateToolbar({
        pageTitle: executionName ? executionName.toString() : ''
      });
      this.setState({ execution });
    } catch (err) {
      this.showPageError(
        `Unable to retrieve ${this.fullTypeName} ${this.id}.`, err);
    }
  }
}
