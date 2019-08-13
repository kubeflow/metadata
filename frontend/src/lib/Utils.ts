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

import {isFunction} from 'lodash';
import {MlMetadataArtifact, MlMetadataValue} from '../apis/service';

export const logger = {
  error: (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.error(...args);
  },
  verbose: (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.log(...args);
  },
};

export function formatDateString(date: Date | string | undefined): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleString();
  } else {
    return date ? date.toLocaleString() : '-';
  }
}

export async function errorToMessage(error: any): Promise<string> {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && error.text && isFunction(error.text)) {
    return await error.text();
  }

  return JSON.stringify(error) || '';
}

/** Title cases a string by capitalizing the first letter of each word. */
export function titleCase(str: string): string {
  return str.split(/[\s_-]/)
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join(' ');
}

/**
 * Safely extracts the named property or custom property from the provided
 * Artifact.
 * @param artifact
 * @param propertyName
 * @param fromCustomProperties
 */
export function getArtifactProperty(artifact: MlMetadataArtifact,
  propertyName: string, fromCustomProperties = false): string | null {
  const props = fromCustomProperties ?
    artifact.custom_properties : artifact.properties;

  return (props && props[propertyName] && props[propertyName].string_value)
    || null;
}

export function getMetadataValue(mlMetadataValue: MlMetadataValue): string | number {
  return mlMetadataValue.double_value || mlMetadataValue.int_value || mlMetadataValue.string_value || '';
}
