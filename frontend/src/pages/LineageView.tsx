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
// tslint:disable: object-literal-sort-keys

import * as React from 'react';
import {Page} from './Page';
import {classes} from 'typestyle';
import {commonCss} from '../Css';
import {/*Api, */ListRequest} from '../lib/Api';
// import {MlMetadataArtifact} from '../apis/service/api';
// import {Link} from 'react-router-dom';
// import {ArtifactType} from '../generated/src/apis/metadata/metadata_store_pb';
// import {GetArtifactTypesRequest} from '../generated/src/apis/metadata/metadata_store_service_pb';
import {ToolbarProps} from '../components/Toolbar';
// import {RoutePage, RouteParams} from '../components/Router';
// import {LineageRow} from '../components/LineageTypes'
import {LineageCardColumn, CardDetails} from '../components/LineageCardColumn';


interface LineageViewState {
  // artifacts: MlMetadataArtifact[];
  // expandedRows: Map<number, Row[]>;
  columnNames: string[];
  columnTypes: string[];
}

class LineageView extends Page<{}, LineageViewState> {
  // private api = Api.getInstance();
  // private nameCustomRenderer: React.FC<CustomRendererProps<string>> =
  //   (props: CustomRendererProps<string>) => {
  //     const [artifactType, artifactId] = props.id.split(':');
  //     const link = RoutePage.ARTIFACT_DETAILS
  //       .replace(`:${RouteParams.ARTIFACT_TYPE}+`, artifactType)
  //       .replace(`:${RouteParams.ID}`, artifactId);
  //     return (
  //       <Link onClick={(e) => e.stopPropagation()}
  //         className={commonCss.link}
  //         to={link}>
  //         {props.value}
  //       </Link>
  //     );
  // }

  constructor(props: any) {
    super(props);
    this.state = {
      columnNames: ['Input Artifact', '', 'Target', '', 'Output Artifact'],
      columnTypes: ['ipa', 'ipx', 'target', 'opx', 'opa'],
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
    const {columnNames} = this.state;
    const mockInputArtifacts = [
      {title: 'Notebook', elements: [
        {title: 'Artifact 1', desc: 'This is really cool', next: true},
        {title: 'Artifact 2', desc: 'This is also kinda cool', next: true},
      ]},
      {title: 'Datasets', elements: [
        {title: 'Artifact w/o desc', prev: true, next: true},
        {title: 'Artifact that should have overflowing text', desc: 'Lorem ipsum', next: true},
      ]},
    ] as CardDetails[];
    const mockOutputArtifacts = [
      {title: 'Hyperparameters', elements: [
        {title: 'Lol', desc: 'Maybe does something', prev: true},
        {title: 'Skip factor', desc: 'How fast should I descent the gradient', prev: true, next: true},
      ]},
      {title: 'Deployments', elements: [
        {title: 'AWS Webserver', desc: 'http://foo.bar/x34s', prev: true, next: true},
        {title: 'Product API', desc: 'Hosted via GCP', prev: true},
      ]},
    ] as CardDetails[];
    const mockExec = [
      {title: 'Execution', elements: [
        {title: 'Some Process', desc: '13,201 Examples', prev: true, next: true}
      ]},
    ] as CardDetails[];
    return (
      <div className={classes(commonCss.page, 'LineageExplorer')} style={{flexFlow: 'row', overflow: 'auto', width: '100%', position: 'relative', background: '#f3f2f4', zIndex: 0}}>
        <LineageCardColumn
          type='artifact'
          cards={mockInputArtifacts}
          title={`${columnNames[0]}`} />
        <LineageCardColumn
          type='execution'
          cards={mockExec}
          title={`${columnNames[1]}`} />
        <LineageCardColumn
          type='artifact'
          cards={[Object.assign({}, mockExec[0], {title: 'Target'})]}
          title={`${columnNames[2]}`} />
        <LineageCardColumn
          type='execution'
          cards={mockExec}
          title={`${columnNames[3]}`} />
        <LineageCardColumn
          type='artifact'
          cards={mockOutputArtifacts}
          reverseBindings={true}
          title={`${columnNames[4]}`} />
        {/* <CustomTable ref={this.tableRef}
          columns={columns}
          rows={rows}
          disablePaging={true}
          disableSelection={true}
          reload={this.reload}
          initialSortColumn='pipelineName'
          initialSortOrder='asc'
          getExpandComponent={this.getExpandedArtifactsRow}
          toggleExpansion={this.toggleRowExpand}
          emptyMessage='No artifacts found.' /> */}
      </div>
    );
  }

  public async refresh(): Promise<void> {
    // Todo: Implement this!
    // if (this.tableRef.current) {
    //   await this.tableRef.current.reload();
    // }
  }

  private async reload(request: ListRequest): Promise<string> {
    // TODO: Consider making an Api method for returning and caching types
    // if (!this.artifactTypes || !this.artifactTypes.size) {
    //   this.artifactTypes = await this.getArtifactTypes();
    // }
    // const {artifacts} = this.state;
    // if (!artifacts.length) {
    //   try {
    //     const response = await this.api.metadataService.listArtifacts2();
    //     this.setState({artifacts: (response && response.artifacts) || []});
    //     this.clearBanner();
    //   } catch (err) {
    //     this.showPageError('Unable to retrieve Artifacts.', err);
    //   }
    // }
    // this.setState({
    //   rows: this.getRowsFromArtifacts(request),
    // });
    return '';
  }

  /**
   * Temporary solution to apply sorting, filtering, and pagination to the
   * local list of artifacts until server-side handling is available
   * TODO: Replace once https://github.com/kubeflow/metadata/issues/73 is done.
   * @param request
   */
  // private getRowsFromArtifacts(request: ListRequest): Row[] {
  //   const collapsedAndExpandedRows = groupRows(this.state.artifacts
  //     .map((a) => { // Flattens
  //       const typeNumber = Number(a.type_id);
  //       const type = this.artifactTypes && this.artifactTypes.get(typeNumber!) ?
  //         this.artifactTypes.get(typeNumber!)!.getName() : typeNumber;
  //       return {
  //         id: `${type}:${a.id}`, // Join with colon so we can build the link
  //         otherFields: [
  //           getResourceProperty(a, ArtifactProperties.PIPELINE_NAME)
  //             || getResourceProperty(a, ArtifactCustomProperties.WORKSPACE, true),
  //           getResourceProperty(a, ArtifactProperties.NAME),
  //           a.id,
  //           type,
  //           a.uri,
  //           // TODO: Get timestamp from the event that created this artifact.
  //           // formatDateString(
  //           //   getArtifactProperty(a, ArtifactProperties.CREATE_TIME) || ''),
  //         ],
  //       } as Row;
  //     })
  //     .filter(rowFilterFn(request))
  //     .sort(rowCompareFn(request, this.state.columns)));

  //   this.setState({ expandedRows: collapsedAndExpandedRows.expandedRows });
  //   return collapsedAndExpandedRows.collapsedRows;
  // }
}

export default LineageView;
