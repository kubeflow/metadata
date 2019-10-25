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
import {Page} from './Page';
import {ToolbarProps} from '../components/Toolbar';
import {RoutePage, RouteParams} from '../components/Router';
import {Api, ArtifactProperties} from '../lib/Api';
import {MlMetadataArtifact} from '../apis/service';
import {classes} from 'typestyle';
import {commonCss, padding} from '../Css';
import {CircularProgress} from '@material-ui/core';
import {titleCase, getResourceProperty} from '../lib/Utils';
import {ResourceInfo} from '../components/ResourceInfo';
import MD2Tabs from '../atoms/MD2Tabs';

export enum ArtifactDetailsTab {
  OVERVIEW = 0,
  LINEAGE_EXPLORER = 1,
  DEPLOYMENTS = 2
}

const tabs = {
  [ArtifactDetailsTab.OVERVIEW]: {name: 'Overview'},
  [ArtifactDetailsTab.LINEAGE_EXPLORER]: {name: 'Lineage Explorer'},
  [ArtifactDetailsTab.DEPLOYMENTS]: {name: 'Deployments'}
};

const tabNames = Object.values(tabs).map(tabConfig => tabConfig.name);

interface ArtifactDetailsState {
  artifact?: MlMetadataArtifact;
  selectedTab: ArtifactDetailsTab;
}

export default class ArtifactDetails extends Page<{}, ArtifactDetailsState> {
  private api = Api.getInstance();

  constructor(props: {}) {
    super(props);
    this.state = {
      selectedTab: ArtifactDetailsTab.OVERVIEW
    };
    this.load = this.load.bind(this);
  }

  private get fullTypeName(): string {
    return this.props.match.params[RouteParams.ARTIFACT_TYPE] || '';
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
    if (!this.state.artifact) return <CircularProgress />;
    return (
      <div className={classes(commonCss.page)}>
        <div className={classes(padding(20, 'tb'))}>
          <MD2Tabs
            tabs={tabNames}
            selectedTab={this.state.selectedTab}
            onSwitch={this.switchTab.bind(this)}
          />
        </div>
        <div className={classes(padding(20, 'lr'))}>
          {this.state.selectedTab === ArtifactDetailsTab.OVERVIEW && (
            <ResourceInfo typeName={this.properTypeName} resource={this.state.artifact} />
          )}
          {this.state.selectedTab === ArtifactDetailsTab.LINEAGE_EXPLORER && (
            <span>Lineage Explorer</span>
          )}
          {this.state.selectedTab === ArtifactDetailsTab.DEPLOYMENTS && <span>Deployments</span>}
        </div>
      </div>
    );
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [{displayName: 'Artifacts', href: RoutePage.ARTIFACTS}],
      pageTitle: `${this.properTypeName} ${this.id} details`
    };
  }

  public async refresh(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    try {
      const {artifact} = await this.api.metadataService.getArtifact(this.id, this.fullTypeName);
      if (!artifact) {
        throw new Error(`No ${this.fullTypeName} identified by id: ${this.id}`);
      }

      const artifactName = getResourceProperty(artifact, ArtifactProperties.NAME);
      let title = artifactName ? artifactName.toString() : '';
      const version = getResourceProperty(artifact, ArtifactProperties.VERSION);
      if (version) {
        title += ` (version: ${version})`;
      }
      this.props.updateToolbar({
        pageTitle: title
      });
      this.setState({artifact});
    } catch (err) {
      this.showPageError(`Unable to retrieve ${this.fullTypeName} ${this.id}.`, err);
    }
  }

  private switchTab(selectedTab: number) {
    this.setState({
      selectedTab
    });
  }
}
