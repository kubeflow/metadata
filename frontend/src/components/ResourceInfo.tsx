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
import {MlMetadataArtifact, MlMetadataExecution} from '../apis/service';
import {getMlMetadataMetadataValue} from '../lib/Utils';

export const css = stylesheet({
  resourceInfo: {
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

export interface ResourceInfoProps {
  typeName: string;
  resource: MlMetadataArtifact | MlMetadataExecution;
}

export class ResourceInfo extends React.Component<ResourceInfoProps, {}> {

  public render(): JSX.Element {
    const { resource } = this.props;
    return (
      <section>
        <h1 className={commonCss.header}>Type: {this.props.typeName}</h1>
        <h2 className={commonCss.header2}>Properties</h2>
        <dl className={css.resourceInfo}>
          {Object.keys(resource.properties || {})
            // TODO: __ALL_META__ is something of a hack, is redundant, and can be ignored
            .filter(k => k !== '__ALL_META__')
            .map(k =>
              <div className={css.field} key={k}>
                <dt className={css.term}>{k}</dt>
                <dd className={css.value}>
                  {resource.properties && getMlMetadataMetadataValue(resource.properties[k])}
                </dd>
              </div>
            )
          }
        </dl>
        <h2 className={commonCss.header2}>Custom Properties</h2>
        <dl className={css.resourceInfo}>
          {Object.keys(resource.custom_properties || {}).map(k =>
            <div className={css.field} key={k}>
              <dt className={css.term}>{k}</dt>
              <dd className={css.value}>
                {resource.custom_properties && getMlMetadataMetadataValue(resource.custom_properties[k])}
              </dd>
            </div>
          )}
        </dl>
      </section>
    );
  }
}
