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
  css as customTableCss, CustomRendererProps, Column,
  Row, ExpandState, CustomTableRow
} from '../components/CustomTable';
import {Page} from './Page';
import {ToolbarProps} from '../components/Toolbar';
import {classes} from 'typestyle';
import {commonCss, padding} from '../Css';
import {getArtifactProperty} from '../lib/Utils';
import {Api, ArtifactProperties, ArtifactCustomProperties, ListRequest} from '../lib/Api';
import {MlMetadataArtifact, MlMetadataArtifactType} from '../apis/service/api';
import {Link} from 'react-router-dom';
import {RoutePage, RouteParams} from '../components/Router';

interface PipelineListState {
  artifacts: MlMetadataArtifact[];
  rows: Row[];
  expandedRows: Map<number, Row[]>;
  columns: Column[];
}

class ArtifactList extends Page<{}, PipelineListState> {
  private tableRef = React.createRef<CustomTable>();
  private api = Api.getInstance();
  private artifactTypes: Map<string, MlMetadataArtifactType>;
  private nameCustomRenderer: React.FC<CustomRendererProps<string>> =
    (props: CustomRendererProps<string>) => {
      const [artifactType, artifactId] = props.id.split(':');
      const link = RoutePage.ARTIFACT_DETAILS
        .replace(`:${RouteParams.ARTIFACT_TYPE}+`, artifactType)
        .replace(`:${RouteParams.ID}`, artifactId);
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
      artifacts: [],
      columns: [
        {label: 'Pipeline/Workspace', flex: 1, sortKey: 'pipelineName'},
        {
          label: 'Name',
          flex: 1,
          customRenderer: this.nameCustomRenderer,
          sortKey: 'name',
        },
        {label: 'Version', flex: 1, sortKey: 'version'},
        {label: 'Type', flex: 2, sortKey: 'type'},
        {label: 'URI', flex: 2, sortKey: 'uri', },
        // TODO: Get timestamp from the event that created this artifact.
        // {label: 'Created at', flex: 1, sortKey: 'created_at'},
      ],
      rows: [],
      expandedRows: new Map(),
    };
    this.reload = this.reload.bind(this);
    this.toggleRowExpand = this.toggleRowExpand.bind(this);
    this.getExpandedRow = this.getExpandedRow.bind(this);
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [],
      pageTitle: 'Artifacts',
    };
  }

  public render(): JSX.Element {
    const {rows, columns} = this.state;
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
          getExpandComponent={this.getExpandedRow}
          toggleExpansion={this.toggleRowExpand}
          emptyMessage='No artifacts found.' />
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
    if (!this.artifactTypes || !this.artifactTypes.size) {
      this.artifactTypes = await this.getArtifactTypes();
    }
    const {artifacts} = this.state;
    if (!artifacts.length) {
      try {
        const response = await this.api.metadataService.listArtifacts2();
        this.setState({artifacts: (response && response.artifacts) || []});
        this.clearBanner();
      } catch (err) {
        this.showPageError('Unable to retrieve Artifacts.', err);
      }
    }
    this.setState({
      rows: this.getRowsFromArtifacts(request),
    });
    return '';
  }

  private async getArtifactTypes():
    Promise<Map<string, MlMetadataArtifactType>> {
    try {
      const response = await this.api.metadataService.listArtifactTypes();
      return new Map(
        response.artifact_types!.map((at) => [at.id!, at])
      );
    } catch (err) {
      this.showPageError(
        'Unable to retrieve Artifact Types, some features may not work.', err);
      return new Map();
    }
  }

  /**
   * Temporary solution to apply sorting, filtering, and pagination to the
   * local list of artifacts until server-side handling is available
   * TODO: Replace once https://github.com/kubeflow/metadata/issues/73 is done.
   * @param request
   */
  private getRowsFromArtifacts(request: ListRequest): Row[] {
    return this.groupRows(this.state.artifacts
      .filter((a) => !!a.properties) // We can't show much without properties
      .map((a) => { // Flattens
        const type = this.artifactTypes && this.artifactTypes.get(a.type_id!) ?
          this.artifactTypes.get(a.type_id!)!.name : a.type_id;
        return {
          id: `${type}:${a.id}`, // Join with colon so we can build the link
          otherFields: [
            getArtifactProperty(a, ArtifactProperties.PIPELINE_NAME)
              || getArtifactProperty(a, ArtifactCustomProperties.WORKSPACE, true),
            getArtifactProperty(a, ArtifactProperties.NAME),
            a.id,
            type,
            a.uri,

            // TODO: Get timestamp from the event that created this artifact.
            // formatDateString(
            //   getArtifactProperty(a, ArtifactProperties.CREATE_TIME) || ''),
          ],
        };
      })
      .filter((r) => !request.filter || r.otherFields.join('')
        .toLowerCase()
        .indexOf(request.filter.toLowerCase()) > -1)
      .sort((r1, r2) => {
        if (!request.sortBy) return -1;

        const sortBy = request.sortBy.endsWith(' desc') ?
          request.sortBy.slice(0, request.sortBy.length - 5) : request.sortBy;
        const sortIndex = this.state.columns
          .findIndex((c) => sortBy === c.sortKey);
        // Convert null to string to avoid null comparison behavior
        const compare = (r1.otherFields[sortIndex] || '') <
          (r2.otherFields[sortIndex] || '');
        if (request.orderAscending) {
          return compare ? -1 : 1;
        } else {
          return compare ? 1 : -1;
        }
      }));
  }

  /**
   * Groups the incoming rows by name and type pushing all but the first row
   * of each group to the expandedRows Map.
   * @param rows
   */
  private groupRows(rows: Row[]): Row[] {
    const flattenedRows = rows.reduce((map, r) => {
      // Artifact row key is "{pipelineName}"
      const stringKey = `${r.otherFields[0]}`;
      const rows = map.get(stringKey);
      if (rows) {
        rows.push(r);
      } else {
        map.set(stringKey, [r]);
      }
      return map;
    }, new Map<string, Row[]>());

    const grouped: Row[] = [];
    const expandedRows = new Map<number, Row[]>();
    Array.from(flattenedRows.entries()) // entries() returns in insertion order
      .forEach((entry, index) => {
        // entry[0] is a grouping key, entry[1] is a list of rows
        const rows = entry[1];

        // If there is only one row in the group, don't allow expansion.
        // Only the first row is displayed when collapsed
        if (rows.length === 1) {
          rows[0].expandState = ExpandState.NONE;
        }

        // Add the first row in this group to be displayed as collapsed row
        grouped.push(rows[0]);

        // Remove the grouping column text for all but the first row in the group because it will be
        // redundant within an expanded group.
        const hiddenRows = rows.slice(1);
        hiddenRows.forEach(row => row.otherFields[0] = '');

        // Add this group of rows sharing a pipeline to the list of grouped rows
        expandedRows.set(index, hiddenRows);
      });

    this.setState({expandedRows});
    return grouped;
  }

  /**
   * Toggles the expansion state of a row
   * @param index
   */
  private toggleRowExpand(index: number): void {
    const {rows} = this.state;
    if (!rows[index]) return;
    rows[index].expandState = rows[index].expandState === ExpandState.EXPANDED ?
      ExpandState.COLLAPSED : ExpandState.EXPANDED;
    this.setState({rows});
  }

  /**
   * Returns a fragment representing the expanded content for the given
   * row.
   * @param index
   */
  private getExpandedRow(index: number): React.ReactNode {
    const rows = this.state.expandedRows.get(index) || [];
    if (!(rows && rows.length)) {
      return <p className={classes(padding(10, 't'), padding(65, 'l'))}>No other rows in group</p>;
    }
    return (
      <div className={padding(65, 'l')}>
        {
          rows.map((r, rindex) => (
            <div className={classes('tableRow', customTableCss.row)} key={rindex}>
              <CustomTableRow row={r} columns={this.state.columns} />
            </div>
          ))
        }
      </div>
    );
  }
}

export default ArtifactList;
