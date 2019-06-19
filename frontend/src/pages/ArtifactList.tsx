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
import CustomTable, {CustomRendererProps, Column, Row} from '../components/CustomTable';
import {Page} from './Page';
import {ToolbarProps} from '../components/Toolbar';
import {classes} from 'typestyle';
import {commonCss, padding} from '../Css';
import {formatDateString} from '../lib/Utils';
import {Api, CustomProperties} from '../lib/Api';
import {MlMetadataArtifact, MlMetadataArtifactType} from '../apis/service/api';
import {Link} from 'react-router-dom';
import {RoutePage, RouteParams} from '../components/Router';

interface PipelineListState {
  artifacts: MlMetadataArtifact[];
}

class ArtifactList extends Page<{}, PipelineListState> {
  private tableRef = React.createRef<CustomTable>();
  private api = Api.getInstance();
  private artifactTypes: Map<string, MlMetadataArtifactType>;
  private nameCustomRenderer: React.FC<CustomRendererProps<string>> =
    (props: CustomRendererProps<string>) => {
      return (
        <Link onClick={(e) => e.stopPropagation()}
          className={commonCss.link}
          to={RoutePage.MODEL_DETAILS.replace(
            ':' + RouteParams.artifactId, props.id)}>
          {props.value}
        </Link>
      );
    }

  constructor(props: any) {
    super(props);
    this.state = {
      artifacts: [],
    };
    this.reload = this.reload.bind(this);
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
      {label: 'Name', flex: 1, customRenderer: this.nameCustomRenderer},
      {label: 'Version', flex: 1},
      {label: 'Type', flex: 1},
      {label: 'URI', flex: 1},
      {label: 'Workspace', flex: 1},
      {label: 'Created at', flex: 1},
    ];

    const rows: Row[] = this.state.artifacts.map((a) => {
      const type = this.artifactTypes && this.artifactTypes.get(a.type_id!) ?
        this.artifactTypes.get(a.type_id!)!.name : a.type_id;
      return {
        id: a.id!,
        otherFields: [
          a.properties!.name.string_value,
          a.properties!.version ? a.properties!.version!.string_value : null,
          type,
          a.uri,
          a.custom_properties![CustomProperties.WORKSPACE] ?
            a.custom_properties![CustomProperties.WORKSPACE].string_value : '',
          formatDateString(a.properties!.create_time!.string_value),
        ],
      };
    });

    return (
      <div className={classes(commonCss.page, padding(20, 'lr'))}>
        <CustomTable ref={this.tableRef}
          columns={columns}
          rows={rows}
          disablePaging={true}
          disableSelection={true}
          reload={this.reload}
          emptyMessage='No artifacts found.' />
      </div>
    );
  }

  public async refresh(): Promise<void> {
    if (this.tableRef.current) {
      await this.tableRef.current.reload();
    }
  }

  private async reload(): Promise<string> {
    if (!this.artifactTypes) {
      this.artifactTypes = await this.getArtifactTypes();
    }
    try {
      const response = await this.api.metadataService.listArtifacts2();
      this.setStateSafe({artifacts: (response && response.artifacts) || []});
      this.clearBanner();
    } catch (err) {
      this.showPageError('Unable to retrieve Metadata artifacts.', err);
    }
    return '';
  }

  private async getArtifactTypes():
    Promise<Map<string, MlMetadataArtifactType>> {
    try {
      throw new Error('Not implemented yet');
      // const response = await this.api.metadataService.listArtifactTypes();
      // return new Map(
      //   response.artifact_types!.map((at) => [at.id!, at])
      // );
    } catch (err) {
      return new Map();
    }
  }
}

export default ArtifactList;
