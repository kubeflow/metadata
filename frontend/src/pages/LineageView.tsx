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
import {ArtifactProperties, ListRequest} from '../lib/Api';
import {ToolbarProps} from '../components/Toolbar';
import {LineageCardColumn, CardDetails} from '../components/LineageCardColumn';
import {LineageActionBar} from "../components/LineageActionBar";
import {Artifact} from "../generated/src/apis/metadata/metadata_store_pb";
import {getResourceProperty} from "../lib/Utils";

interface LineageViewProps {
  target?: Artifact
}

interface LineageViewState {
  columnNames: string[];
  columnTypes: string[];
  target?: Artifact;
}

class LineageView extends Page<LineageViewProps, LineageViewState> {
  private readonly actionBarRef: React.Ref<LineageActionBar>;

  constructor(props: any) {
    super(props);
    this.actionBarRef = React.createRef<LineageActionBar>();
    this.state = {
      columnNames: ['Input Artifact', '', 'Target', '', 'Output Artifact'],
      columnTypes: ['ipa', 'ipx', 'target', 'opx', 'opa'],
      target: props.target
    };
    this.reload = this.reload.bind(this);
    this.setTargetFromActionBar = this.setTargetFromActionBar.bind(this);
    this.setTargetFromLineageCard = this.setTargetFromLineageCard.bind(this);
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
    const targetTitle = this.state.target ? getResourceProperty(this.state.target, ArtifactProperties.NAME) : '';
    const mockTarget = [...mockExec];
    mockTarget[0].elements[0].title = targetTitle ? targetTitle as string : '';
    return (
      <div className={classes(commonCss.page)}>
        <LineageActionBar ref={this.actionBarRef} initialTarget={this.props.target} setLineageViewTarget={this.setTargetFromActionBar} />
        <div className={classes(commonCss.page, 'LineageExplorer')} style={{flexFlow: 'row', overflow: 'auto', width: '100%', position: 'relative', background: '#f3f2f4', zIndex: 0}}>
          <LineageCardColumn
            type='artifact'
            cards={mockInputArtifacts}
            title={`${columnNames[0]}`}
            setLineageViewTarget={this.setTargetFromLineageCard}
          />
          <LineageCardColumn
            type='execution'
            cards={mockExec}
            title={`${columnNames[1]}`} />
          <LineageCardColumn
            type='artifact'
            cards={mockTarget}
            title={`${columnNames[2]}`} />
          <LineageCardColumn
            type='execution'
            cards={mockExec}
            title={`${columnNames[3]}`} />
          <LineageCardColumn
            type='artifact'
            cards={mockOutputArtifacts}
            reverseBindings={true}
            title={`${columnNames[4]}`}
            setLineageViewTarget={this.setTargetFromLineageCard}
          />
        </div>
      </div>
    );
  }

  public async refresh(): Promise<void> {
    // Todo: Implement this!
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

  // Updates the view and action bar when the target is set from a lineage card.
  private setTargetFromLineageCard(target: Artifact) {
    if (!this.actionBarRef) {
      return
    }
    // @ts-ignore
    const actionBar = this.actionBarRef.current as LineageActionBar;
    actionBar.pushHistory(target);
    this.target = target;
  }

  // Updates the view when the target is changed from the action bar.
  private setTargetFromActionBar(target: Artifact) {
    this.target = target;
  }

  private set target(target: Artifact) {
    this.setState({
      target,
    });
  }
}

export default LineageView;
