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
import {MlMetadataArtifact} from '../apis/service';
import { getMetadataValue } from '../lib/Utils';

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
    return (
      <section>
        <h1 className={commonCss.header}>Type: {this.props.typeName}</h1>
        <h2 className={commonCss.header2}>Properties</h2>
        <dl className={css.artifactInfo}>
          {Object.keys(artifact.properties || {})
            // TODO: __ALL_META__ is something of a hack, is redundant, and can be ignored
            .filter(k => k !== '__ALL_META__')
            .map(k =>
              <div className={css.field} key={k}>
                <dt className={css.term}>{k}</dt>
                <dd className={css.value}>
                  {artifact.properties && getMetadataValue(artifact.properties[k])}
                </dd>
              </div>
            )
          }
        </dl>
        <h2 className={commonCss.header2}>Custom Properties</h2>
        <dl className={css.artifactInfo}>
          {Object.keys(artifact.custom_properties || {}).map(k =>
            <div className={css.field} key={k}>
              <dt className={css.term}>{k}</dt>
              <dd className={css.value}>
                {artifact.custom_properties && getMetadataValue(artifact.custom_properties[k])}
              </dd>
            </div>
          )}
        </dl>
      </section>
    );
  }
}
