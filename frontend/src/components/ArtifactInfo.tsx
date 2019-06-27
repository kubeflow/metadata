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
import {stylesheet} from 'typestyle';
import {color, commonCss} from '../Css';
import {formatDateString, getArtifactProperty} from '../lib/Utils';
import {MlMetadataArtifact} from '../apis/service';
import {ArtifactProperties, ArtifactCustomProperties} from '../lib/Api';
import {ModelInfo} from './ModelInfo';

export const css = stylesheet({
  artifactInfo: {
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

export interface ArtifactInfoProps {
  typeName: string;
  artifact: MlMetadataArtifact;
}

export class ArtifactInfo extends React.Component<ArtifactInfoProps, {}> {

  public render(): JSX.Element {
    const {artifact} = this.props;
    const createTime = formatDateString(
      getArtifactProperty(artifact, ArtifactProperties.CREATE_TIME) || '');
    return (
      <section>
        <h1 className={commonCss.header}>{this.props.typeName} info</h1>
        <dl className={css.artifactInfo}>
          <div className={css.field}>
            <dt className={css.term}>Version ID</dt>
            <dd className={css.value}>
              {getArtifactProperty(artifact, ArtifactProperties.VERSION)}
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Workspace</dt>
            <dd className={css.value}>
              {getArtifactProperty(artifact, ArtifactCustomProperties.WORKSPACE,
                true)}
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Run</dt>
            <dd className={css.value}>
              {getArtifactProperty(artifact, ArtifactCustomProperties.RUN,
                true)}
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Description</dt>
            <dd className={css.value}>
              {getArtifactProperty(artifact, ArtifactProperties.DESCRIPTION)}
            </dd>
          </div>
          <div className={css.field}>
            <dt className={css.term}>Creation time</dt>
            <dd className={css.value}>{createTime}</dd>
          </div>
          {this.props.typeName === 'Model' ?
            <ModelInfo model={artifact} /> :
            <div className={css.field}>
              <dt className={css.term}>URI</dt>
              <dd className={css.value}>{artifact.uri}</dd>
            </div>
          }
        </dl>
      </section>
    );
  }
}
