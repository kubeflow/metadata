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
import {stylesheet, classes} from 'typestyle';
import {color, commonCss} from '../Css';
import {formatDateString} from '../lib/Utils';

const css = stylesheet({
  modelInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  field: {
    flexBasis: '300px',
    marginBottom: '32px',
  },
  term: {
    color: color.grey,
    fontSize: '12px',
    letterSpacing: '0.2px',
    lineHeight: '16px',
  },
  value: {
    color: color.secondaryText,
    fontSize: '14px',
    letterSpacing: '0.2px',
    lineHeight: '20px',
  }
});

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

export class ModelInfo extends React.Component<ModelInfoProps, {}> {

  public render(): JSX.Element {
    const createTime = formatDateString(this.props.createTime);
    return (
      <section>
        <h1 className={commonCss.header}>Model info</h1>
        <dl className={css.modelInfo}>
          <div className={css.field}>
            <dt className={css.term}>Type</dt>
            <dd className={css.value}>{this.props.modelType}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Description</dt>
            <dd className={css.value}>{this.props.description}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Version ID</dt>
            <dd className={css.value}>{this.props.version}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Workspace</dt>
            <dd className={css.value}>{this.props.workspace}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Run</dt>
            <dd className={css.value}>{this.props.run}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Creation time</dt>
            <dd className={css.value}>{createTime}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Hyperparameters</dt>
            <dd className={classes(css.value, commonCss.flexColumn)}>{
              this.props.hyperparameters &&
              Object.entries(this.props.hyperparameters)
                .map((e, i) => <span key={i}>{`${e[0]}: ${e[1]}`}</span>)
            }
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Training data</dt>
            <dd className={css.value}>{this.props.uri}</dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Training framework</dt>
            <dd className={css.value}>
              {
                this.props.trainingFramework ?
                  `${this.props.trainingFramework.name}
                   ${this.props.trainingFramework.version || ''}` : ''
              }
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Training data</dt>
            <dd className={css.value}>{this.props.uri}</dd>
          </div>
        </dl>
      </section>
    );
  }
}
