/*
 * Copyright 2018 Google LLC
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

import {
  rowFilterFn,
  rowCompareFn,
  groupRows,
} from './Utils';
import { Column, Row, ExpandState } from '../components/CustomTable';

describe('Utils', () => {
  // rowFilterFn returns a function, so we just immediately call that function in the tests
  describe('rowFilterFn', () => {
    const row = {
      id: '1',
      otherFields: ['pipelineName-1', 'artifactName-1']
    };

    it('returns true if filter is not specified', () => {
      expect(rowFilterFn({})(row)).toEqual(true);
    });

    it('returns true if filter matches any of the row\'s otherFields', () => {
      expect(rowFilterFn({ filter: 'pipe'})(row)).toEqual(true);
    });

    it('returns true if filter matches any of the row\'s otherFields, ignoring case', () => {
      expect(rowFilterFn({ filter: 'PIPE'})(row)).toEqual(true);
    });


    it('returns false if filter fails to match any of the row\'s otherFields', () => {
      expect(rowFilterFn({ filter: 'xyz'})(row)).toEqual(false);
    });
  });

  // rowFilterFn returns a function, so we just immediately call that function in the tests
  describe('rowCompareFn', () => {
    const row1 = {
      id: '1',
      otherFields: ['pipelineName-1', 'artifactName-1']
    };

    const row2 = {
      id: '2',
      otherFields: ['pipelineName-2', 'artifactName-2']
    };

    const columns: Column[] = [
        {
          label: 'Pipeline/Workspace',
          sortKey: 'pipelineName'
        },
        {
          label: 'Name',
          sortKey: 'name',
        },
    ];

    it('returns -1 if request does not include sortBy', () => {
      expect(rowCompareFn({}, [])(row1, row2)).toEqual(-1);
    });

    it('returns -1 if row1 should be ordered before row2 and order is ascending', () => {
      expect(rowCompareFn({ sortBy: 'name', orderAscending: true }, columns)(row1, row2)).toEqual(-1);
    });

    it('returns 1 if row1 should be ordered before row2 and order is descending', () => {
      expect(rowCompareFn({ sortBy: 'name', orderAscending: false }, columns)(row1, row2)).toEqual(1);
    });

    it('does not throw an error if sortBy is not found in the rows\' otherFields', () => {
      expect(rowCompareFn({ sortBy: 'test' }, columns)(row1, row2)).toEqual(-1);
    });
  });

  describe('groupRows', () => {
    const getTestRows: () => Row[] = () => {
      return [
        {
          id: 'dataset:1',
          otherFields: ['pipelineName-1', 'artifactName-1', '1', 'dataset', 'uri-1']
        },
        {
          id: 'model:1',
          otherFields: ['pipelineName-1', 'artifactName-2', '2', 'model', 'uri-2']
        },
        {
          id: 'model:2',
          otherFields: ['pipelineName-2', 'artifactName-3', '3', 'model', 'uri-3']
        },
      ];
    };

    it('returns an array containing the first row of each group and a map of toplevel row indices to all rows in that group', () => {
      const collapsedAndExpandedRows = groupRows(getTestRows());
      
      // There are two toplevel rows/groups
      expect(collapsedAndExpandedRows.collapsedRows).toHaveLength(2);

      // Collapsed rows will contain the first row of each group
      expect(collapsedAndExpandedRows.collapsedRows.map(rows => rows.id)).toEqual([
        'dataset:1', 'model:2',
      ]);
      
      // The first group has two elements, so there is one row to show when expanded
      expect(collapsedAndExpandedRows.expandedRows.get(0)).toHaveLength(1);
      expect(collapsedAndExpandedRows.expandedRows.get(0)![0].id).toEqual('model:1');

      // The second group has one element, so there are no rows to show when expanded
      expect(collapsedAndExpandedRows.expandedRows.get(1)).toHaveLength(0);
    });

    it('sets expanded state to NONE for groups with one element', () => {
      const collapsedAndExpandedRows = groupRows(getTestRows());
      expect(collapsedAndExpandedRows.collapsedRows[1].expandState).toEqual(ExpandState.NONE);
    });

    it('removes the first column from the rows put into expandedRows', () => {
      const testRows = getTestRows();

      expect(testRows[1].id).toEqual('model:1')
      expect(testRows[1].otherFields[0]).toEqual('pipelineName-1')

      const collapsedAndExpandedRows = groupRows(testRows);

      // Both of these 'expects' are looking at the same field in the same row that were asserted
      // against above, but it should be cleared within the expandedRows map so as to reduce
      // unnecessary clutter in the UI
      expect(collapsedAndExpandedRows.expandedRows.get(0)![0].id).toEqual('model:1');
      expect(collapsedAndExpandedRows.expandedRows.get(0)![0].otherFields[0]).toEqual('');
    });
  });
});
