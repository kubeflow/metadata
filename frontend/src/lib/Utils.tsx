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
import { isFunction } from 'lodash';
import { MlMetadataArtifact, MlMetadataExecution, MlMetadataValue } from '../apis/service';
import { css as customTableCss } from '../components/CustomTable';
import { classes } from 'typestyle';
import { Row, Column, ExpandState, CustomTableRow } from '../components/CustomTable';
import { ListRequest } from './Api';
import { padding } from '../Css';
import {
  Artifact,
  Execution, Value
} from "../generated/src/apis/metadata/metadata_store_pb";

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
 * Artifact or Execution.
 * @param resource
 * @param propertyName
 * @param fromCustomProperties
 */
export function getMlMetadataResourceProperty(resource: MlMetadataArtifact | MlMetadataExecution,
  propertyName: string, fromCustomProperties = false): string | number | null {
  const props = fromCustomProperties
    ? resource.custom_properties
    : resource.properties;

  return (props && props[propertyName] && getMlMetadataMetadataValue(props[propertyName]))
    || null;
}

export function getMlMetadataMetadataValue(mlMetadataValue: MlMetadataValue): string | number {
  // TODO: Swagger takes a int64 type from a .proto and converts it to string in Typescript, so
  // int_value has type string.
  return mlMetadataValue.double_value || mlMetadataValue.int_value || mlMetadataValue.string_value || '';
}

export function getResourceProperty(resource: Artifact | Execution,
    propertyName: string, fromCustomProperties = false): string | number | null {
  const props = fromCustomProperties
      ? resource.getCustomPropertiesMap()
      : resource.getPropertiesMap();

  return (props && props.get(propertyName) && getMetadataValue(props.get(propertyName)))
      || null;
}

export function getMetadataValue(value: Value): string | number {
  // TODO: Swagger takes a int64 type from a .proto and converts it to string in Typescript, so
  // int_value has type string.
  return value.getDoubleValue() || value.getIntValue() || value.getStringValue() || '';
}

/**
 * Returns true if no filter is specified, or if the filter string matches any of the row's columns,
 * case insensitively.
 * @param request
 */
export function rowFilterFn(request: ListRequest): (r: Row) => boolean {
  // TODO: We are currently searching across all properties of all artifacts. We should figure
  // what the most useful fields are and limit filtering to those
  return (r) => !request.filter
    || (r.otherFields.join('').toLowerCase().indexOf(request.filter.toLowerCase()) > -1);
}

export function rowCompareFn(request: ListRequest, columns: Column[]): (r1: Row, r2: Row) => number {
  return (r1, r2) => {
    if (!request.sortBy) {
      return -1;
    }

    const sortIndex = columns.findIndex((c) => request.sortBy === c.sortKey);

    // Convert null to string to avoid null comparison behavior
    const compare = (r1.otherFields[sortIndex] || '') < (r2.otherFields[sortIndex] || '');
    if (request.orderAscending) {
      return compare ? -1 : 1;
    } else {
      return compare ? 1 : -1;
    }
  };
}

export interface CollapsedAndExpandedRows {
  // collapsedRows are the first row of each group, what the user sees before expanding a group.
  collapsedRows: Row[];
  // expandedRows is a map of grouping keys to a list of rows grouped by that key. This is what a
  // user sees when they expand one or more rows.
  expandedRows: Map<number, Row[]>;
}

/**
 * Groups the incoming rows by name and type pushing all but the first row
 * of each group to the expandedRows Map.
 * @param rows
 */
export function groupRows(rows: Row[]): CollapsedAndExpandedRows {
  const flattenedRows = rows.reduce((map, r) => {
    const stringKey = r.otherFields[0];
    const rows = map.get(stringKey);
    if (rows) {
      rows.push(r);
    } else {
      map.set(stringKey, [r]);
    }
    return map;
  }, new Map<string, Row[]>());

  const collapsedAndExpandedRows: CollapsedAndExpandedRows = {
    collapsedRows: [],
    expandedRows: new Map<number, Row[]>(),
  }
  // collapsedRows are the first row of each group, what the user sees before expanding a group.
  Array.from(flattenedRows.entries()) // entries() returns in insertion order
    .forEach((entry, index) => {
      // entry[0] is a grouping key, entry[1] is a list of rows
      const rows = entry[1];

      // If there is only one row in the group, don't allow expansion.
      // Only the first row is displayed when collapsed
      if (rows.length === 1) {
        rows[0].expandState = ExpandState.NONE;
      }

      // Add the first row in this group to be displayed as collapsed row
      collapsedAndExpandedRows.collapsedRows.push(rows[0]);

      // Remove the grouping column text for all but the first row in the group because it will be
      // redundant within an expanded group.
      const hiddenRows = rows.slice(1);
      hiddenRows.forEach(row => row.otherFields[0] = '');

      // Add this group of rows sharing a pipeline to the list of grouped rows
      collapsedAndExpandedRows.expandedRows.set(index, hiddenRows);
    });

  return collapsedAndExpandedRows;
}

/**
 * Returns a fragment representing the expanded content for the given
 * row.
 * @param index
 */
export function getExpandedRow(expandedRows: Map<number, Row[]>, columns: Column[]): (index: number) => React.ReactNode {
  return (index: number) => {
    const rows = expandedRows.get(index) || [];

    return (
      <div className={padding(65, 'l')}>
        {
          rows.map((r, rindex) => (
            <div className={classes('tableRow', customTableCss.row)} key={rindex}>
              <CustomTableRow row={r} columns={columns} />
            </div>
          ))
        }
      </div>
    );
  }
}
