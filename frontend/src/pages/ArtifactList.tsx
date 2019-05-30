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
import CustomTable, { Column, Row } from '../components/CustomTable';
import { Page } from './Page';
import { ToolbarProps } from '../components/Toolbar';
import { classes } from 'typestyle';
import { commonCss, padding } from '../Css';
import { formatDateString } from '../lib/Utils';

interface PipelineListState {
  artifacts: any[];
  selectedIds: string[];
  uploadDialogOpen: boolean;
}

class ArtifactList extends Page<{}, PipelineListState> {
  private _tableRef = React.createRef<CustomTable>();

  constructor(props: any) {
    super(props);

    this.state = {
      artifacts: [],
      selectedIds: [],
      uploadDialogOpen: false,
    };
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [],
      pageTitle: 'Artifacts',
    };
  }

  public render(): JSX.Element {
    const columns: Column[] = [
      { label: 'Name', flex: 1 },
      { label: 'Id', flex: 1 },
      { label: 'Type', flex: 1 },
      { label: 'workspace', flex: 1 },
      { label: 'Created at', flex: 1 },
    ];

    const rows: Row[] = this.state.artifacts.map((a) => {
      return {
        id: a.id!,
        otherFields: [a.name!, a.description!, formatDateString(a.created_at!)],
      };
    });

    return (
      <div className={classes(commonCss.page, padding(20, 'lr'))}>
        <CustomTable ref={this._tableRef} columns={columns} rows={rows}
          updateSelection={this._selectionChanged.bind(this)} selectedIds={this.state.selectedIds}
          reload={this._reload.bind(this)}
          emptyMessage='No artifacts found.' />
      </div>
    );
  }

  public async refresh(): Promise<void> {
    if (this._tableRef.current) {
      await this._tableRef.current.reload();
    }
  }

  private async _reload(request: any): Promise<string> {
    let response: any | null = null;
    // try {
    //   response = await Apis.pipelineServiceApi.listPipelines(
    //     request.pageToken, request.pageSize, request.sortBy, request.filter);
    //   this.clearBanner();
    // } catch (err) {
    //   await this.showPageError('Error: failed to retrieve list of pipelines.', err);
    // }

    this.setStateSafe({ artifacts: (response && response.artifacts) || [] });

    return response ? response.next_page_token || '' : '';
  }

  private _selectionChanged(selectedIds: string[]): void {
    this.setStateSafe({ selectedIds });
  }
}

export default ArtifactList;
