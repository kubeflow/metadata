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
import CustomTable, {
  CustomRendererProps, Column,
  Row, ExpandState
} from '../components/CustomTable';
import { Page } from './Page';
import { ToolbarProps } from '../components/Toolbar';
import { classes } from 'typestyle';
import { commonCss, padding } from '../Css';
import { getResourceProperty, rowCompareFn, rowFilterFn, groupRows, getExpandedRow } from '../lib/Utils';
import { Api, ListRequest, ExecutionProperties, ExecutionCustomProperties } from '../lib/Api';
import { MlMetadataExecutionType, MlMetadataExecution } from '../apis/service/api';
import { Link } from 'react-router-dom';
import { RoutePage, RouteParams } from '../components/Router';

interface ExecutionListState {
  executions: MlMetadataExecution[];
  rows: Row[];
  expandedRows: Map<number, Row[]>;
  columns: Column[];
}

class ExecutionList extends Page<{}, ExecutionListState> {
  private tableRef = React.createRef<CustomTable>();
  private api = Api.getInstance();
  private executionTypes: Map<string, MlMetadataExecutionType>;
  private nameCustomRenderer: React.FC<CustomRendererProps<string>> =
    (props: CustomRendererProps<string>) => {
      const [executionsType, executionsId] = props.id.split(':');
      const link = RoutePage.EXECUTION_DETAILS
        .replace(`:${RouteParams.EXECUTION_TYPE}+`, executionsType)
        .replace(`:${RouteParams.ID}`, executionsId);
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
        { label: 'Pipeline/Workspace', flex: 2, sortKey: 'pipelineName' },
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
    try {
      const response = await this.api.metadataService.listExecutions2();
      this.setState({ executions: (response && response.executions) || [] });
      this.clearBanner();
    } catch (err) {
      this.showPageError('Unable to retrieve Executions.', err);
    }
    this.setState({
      rows: this.getRowsFromExecutions(request),
    });
    return '';
  }

  private async getExecutionTypes(): Promise<Map<string, MlMetadataExecutionType>> {
    try {
      const response = await this.api.metadataService.listExecutionTypes();
      return new Map(response.execution_types!.map((ex) => [ex.id!, ex]));
    } catch (err) {
      this.showPageError('Unable to retrieve Execution Types, some features may not work.', err);
      return new Map();
    }
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
        const type = this.executionTypes && this.executionTypes.get(execution.type_id!) ?
          this.executionTypes.get(execution.type_id!)!.name : execution.type_id;
        return {
          id: `${type}:${execution.id}`, // Join with colon so we can build the link
          otherFields: [
            getResourceProperty(execution, ExecutionProperties.PIPELINE_NAME)
            || getResourceProperty(execution, ExecutionCustomProperties.WORKSPACE, true),
            getResourceProperty(execution, ExecutionProperties.NAME),
            getResourceProperty(execution, ExecutionProperties.STATE),
            execution.id,
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
    this.setState({ rows });
  }

  private getExpandedExecutionsRow(index: number): React.ReactNode {
    return getExpandedRow(this.state.expandedRows, this.state.columns)(index);
  }
}

export default ExecutionList;
