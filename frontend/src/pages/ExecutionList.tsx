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

import {
  Api,
  Execution,
  ExecutionCustomProperties,
  ExecutionProperties,
  ExecutionType,
  GetExecutionsRequest,
  GetExecutionTypesRequest,
  ListRequest,
  getResourceProperty,
} from 'frontend';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { classes } from 'typestyle';
import CustomTable, { Column, Row, ExpandState, CustomRendererProps } from '../components/CustomTable';
import { ToolbarProps } from '../components/Toolbar';
import { commonCss, padding } from '../Css';
import { rowCompareFn, rowFilterFn, groupRows, getExpandedRow } from '../lib/Utils';
import { RoutePage, RouteParams } from '../components/Router';
import { Page } from './Page';

interface ExecutionListState {
  executions: Execution[];
  rows: Row[];
  expandedRows: Map<number, Row[]>;
  columns: Column[];
}

class ExecutionList extends Page<{}, ExecutionListState> {
  private tableRef = React.createRef<CustomTable>();
  private api = Api.getInstance();
  private executionTypes: Map<number, ExecutionType>;
  private nameCustomRenderer: React.FC<CustomRendererProps<string>> =
    (props: CustomRendererProps<string>) => {
      const [executionType, executionId] = props.id.split(':');
      const link = RoutePage.EXECUTION_DETAILS
        .replace(`:${RouteParams.EXECUTION_TYPE}+`, executionType)
        .replace(`:${RouteParams.ID}`, executionId);
      return (
        <Link onClick={(e) => e.stopPropagation()}
          className={commonCss.link}
          to={link}>
          {props.value}
        </Link>
      );
  }


  constructor(props: any) {
    super(props);
    this.state = {
      executions: [],
      columns: [
        {
          label: 'Pipeline/Workspace',
          flex: 2,
          customRenderer: this.nameCustomRenderer,
          sortKey: 'pipelineName'
        },
        {
          label: 'Name',
          flex: 1,
          customRenderer: this.nameCustomRenderer,
          sortKey: 'name',
        },
        { label: 'State', flex: 1, sortKey: 'state', },
        { label: 'ID', flex: 1, sortKey: 'id' },
        { label: 'Type', flex: 2, sortKey: 'type' },
      ],
      rows: [],
      expandedRows: new Map(),
    };
    this.reload = this.reload.bind(this);
    this.toggleRowExpand = this.toggleRowExpand.bind(this);
    this.getExpandedExecutionsRow = this.getExpandedExecutionsRow.bind(this);
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [],
      pageTitle: 'Executions',
    };
  }

  public render(): JSX.Element {
    const { rows, columns } = this.state;
    return (
      <div className={classes(commonCss.page, padding(20, 'lr'))}>
        <CustomTable ref={this.tableRef}
          columns={columns}
          rows={rows}
          disablePaging={true}
          disableSelection={true}
          reload={this.reload}
          initialSortColumn='pipelineName'
          initialSortOrder='asc'
          getExpandComponent={this.getExpandedExecutionsRow}
          toggleExpansion={this.toggleRowExpand}
          emptyMessage='No executions found.' />
      </div>
    );
  }

  public async refresh(): Promise<void> {
    if (this.tableRef.current) {
      await this.tableRef.current.reload();
    }
  }

  private async reload(request: ListRequest): Promise<string> {
    // TODO: Consider making an Api method for returning and caching types
    if (!this.executionTypes || !this.executionTypes.size) {
      this.executionTypes = await this.getExecutionTypes();
    }
    if (!this.state.executions.length) {
      const executions = await this.getExecutions();
      this.setState({ executions });
      this.clearBanner();
    }
    this.setState({
      rows: this.getRowsFromExecutions(request),
    });
    return '';
  }

  private async getExecutionTypes(): Promise<Map<number, ExecutionType>> {
    const response =
        await this.api.metadataStoreService.getExecutionTypes(new GetExecutionTypesRequest());

    if (!response) {
      this.showPageError('Unable to retrieve Execution Types, some features may not work.');
      return new Map();
    }

    const executionTypesMap = new Map<number, ExecutionType>();

    (response!.getExecutionTypesList() || []).forEach((executionType) => {
      executionTypesMap.set(executionType.getId()!, executionType);
    });

    return executionTypesMap;
  }

  private async getExecutions(): Promise<Execution[]> {
    const response = await this.api.metadataStoreService.getExecutions(new GetExecutionsRequest());

    if (!response) {
      this.showPageError('Unable to retrieve Executions.');
      return []
    }

    return response!.getExecutionsList() || [];
  }

  /**
   * Temporary solution to apply sorting, filtering, and pagination to the
   * local list of executions until server-side handling is available
   * TODO: Replace once https://github.com/kubeflow/metadata/issues/73 is done.
   * @param request
   */
  private getRowsFromExecutions(request: ListRequest): Row[] {
    const collapsedAndExpandedRows = groupRows(this.state.executions
      .map((execution) => { // Flattens
        const type = this.executionTypes && this.executionTypes.get(execution.getTypeId()!) ?
          this.executionTypes.get(execution.getTypeId()!)!.getName() : execution.getTypeId();
        return {
          id: `${type}:${execution.getId()}`, // Join with colon so we can build the link
          otherFields: [
            getResourceProperty(execution, ExecutionProperties.PIPELINE_NAME)
            || getResourceProperty(execution, ExecutionCustomProperties.WORKSPACE, true),
            getResourceProperty(execution, ExecutionProperties.COMPONENT_ID),
            getResourceProperty(execution, ExecutionProperties.STATE),
            execution.getId(),
            type,
          ],
        };
      })
      .filter(rowFilterFn(request))
      .sort(rowCompareFn(request, this.state.columns)));

    this.setState({ expandedRows: collapsedAndExpandedRows.expandedRows });
    return collapsedAndExpandedRows.collapsedRows;
  }

  /**
   * Toggles the expansion state of a row
   * @param index
   */
  private toggleRowExpand(index: number): void {
    const { rows } = this.state;
    if (!rows[index]) {
      return;
    }
    rows[index].expandState = rows[index].expandState === ExpandState.EXPANDED
      ? ExpandState.COLLAPSED
      : ExpandState.EXPANDED;
    this.setState({rows});
  }

  private getExpandedExecutionsRow(index: number): React.ReactNode {
    return getExpandedRow(this.state.expandedRows, this.state.columns)(index);
  }
}

export default ExecutionList;
