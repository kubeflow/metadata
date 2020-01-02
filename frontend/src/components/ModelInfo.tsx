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
import {Artifact} from 'frontend';
import * as React from 'react';
import {classes} from 'typestyle';
import {commonCss} from '../Css';
import {getResourceProperty, logger} from '../lib/Utils';
import {css} from './ResourceInfo';
import {ArtifactProperties} from '../lib/Api';

// Standard artifact properties and Model properties from
// https://github.com/kubeflow/metadata/blob/master/schema/alpha/artifacts/model.json
export interface ModelInfoProps {
  description?: string;
  version?: string;
  createTime?: string;
  uri?: string;
  workspace?: string;
  run?: string;
  apiVersion?: string;
  hyperparameters?: {[name: string]: {}};
  modelType?: string;
  trainingFramework?: {name: string, version: string};
}

// From ../../schema/alpha/artifacts/model.json
interface ModelSchema {
  hyperparameters?: {[name: string]: string};
  model_type?: string;
  training_framework?: {name: string, version: string};
}

export class ModelInfo extends React.Component<{model: Artifact}, {}> {

  public render(): JSX.Element {
    const {model} = this.props;
    let modelData: ModelSchema = {};
    const modelDataJSON = getResourceProperty(model, ArtifactProperties.ALL_META);
    try {
      modelData = JSON.parse(modelDataJSON ? modelDataJSON.toString() : '{}');
    } catch (err) {
      logger.error(
        `Unable to parse ${ArtifactProperties.ALL_META} property`, err);
    }

    return (
      <React.Fragment>
        <div className={css.field}>
          <dt className={css.term}>Type</dt>
          <dd className={css.value}>{modelData.model_type}</dd>
        </div>
        <div className={css.field}>
          <dt className={css.term}>Hyperparameters</dt>
          <dd className={classes(css.value, commonCss.flexColumn)}>{
            modelData.hyperparameters &&
            Object.entries(modelData.hyperparameters)
              .map((e, i) => <span key={i}>{`${e[0]}: ${e[1]}`}</span>)
          }
          </dd>
        </div>
        <div className={css.field}>
          <dt className={css.term}>Training data</dt>
          <dd className={css.value}>{this.props.model.getUri()}</dd>
        </div>
        <div className={css.field}>
          <dt className={css.term}>Training framework</dt>
          <dd className={css.value}>
            {
              modelData.training_framework ?
                `${modelData.training_framework.name}
                   ${modelData.training_framework.version || ''}` : ''
            }
          </dd>
        </div>
      </React.Fragment>
    );
  }
}
