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
import {ModelInfo, ModelInfoProps} from '../components/ModelInfo';
import {ToolbarProps} from '../components/Toolbar';
import {RoutePage, RouteParams} from '../components/Router';
import {Api, CustomProperties} from '../lib/Api';
import {MlMetadataArtifact} from '../apis/service';
import {classes} from 'typestyle';
import {commonCss, padding} from '../Css';
import {LinearProgress} from '@material-ui/core';
import {logger} from '../lib/Utils';

interface ModelDetailsState {
  model?: MlMetadataArtifact;
}

// From ../../schema/alpha/artifacts/model.json
interface ModelSchema {
  hyperparameters?: {[name: string]: string};
  model_type?: string;
  training_framework?: {name: string, version: string};
}

export default class ModelDetails extends Page<{}, ModelDetailsState> {
  private api = Api.getInstance();

  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    return this.load();
  }

  public render(): JSX.Element {
    const {model} = this.state;
    if (!model) return <LinearProgress />;
    const modelInfoProps: ModelInfoProps = {
      description: model.properties!.description.string_value,
      version: model!.properties!.version.string_value,
      createTime: model!.properties!.create_time.string_value,
      uri: model!.uri,
      workspace: model!.custom_properties![CustomProperties.WORKSPACE].string_value,
      run: model!.custom_properties![CustomProperties.RUN].string_value
    };
    // let parsedModelInfo: ModelInfoProps
    let parsedMetadata: ModelSchema;
    if (model && model.properties![CustomProperties.ALL_META]) {
      try {
        parsedMetadata = JSON.parse(
          model.properties![CustomProperties.ALL_META]!.string_value!);
        modelInfoProps.hyperparameters = parsedMetadata.hyperparameters;
        modelInfoProps.modelType = parsedMetadata.model_type;
        modelInfoProps.trainingFramework = parsedMetadata.training_framework;
      } catch (err) {
        logger.error('Unable to parse CustomProperties.ALL_META', err);
      }
    }
    return (
      <div className={classes(commonCss.page, padding(20, 'lr'))}>
        {!!model && (
          <div>
            <ModelInfo {...modelInfoProps} />
            <pre style={{marginTop: '10px', borderTop: '1px solid #000'}}>
              {JSON.stringify(this.state.model, undefined, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  public getInitialToolbarState(): ToolbarProps {
    return {
      actions: [],
      breadcrumbs: [{displayName: 'Artifacts', href: RoutePage.ARTIFACTS}],
      pageTitle: `Model ${this.props.match.params[RouteParams.artifactId]} details`
    };
  }

  public async refresh(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    // TODO: Use the getArtifact API method which doesn't seem to be generated
    const id = this.props.match.params[RouteParams.artifactId];
    try {
      const response = await this.api.metadataService.listArtifacts2();
      const [model] = response.artifacts!.filter((a) => id === a.id);
      if (model) {
        let title = model.properties!.name!.string_value!;
        if (model.properties!.version) {
          title += ` (version: ${model.properties!.version!.string_value})`;
        }
        this.props.updateToolbar({
          pageTitle: title
        });
        this.setState({model});
      }
    } catch (err) {
      this.showPageError(`Unable to retrieve Model ${id}`, err);
    }
  }
}
