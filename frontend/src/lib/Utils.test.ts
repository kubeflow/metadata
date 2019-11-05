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
  logger,
  formatDateString,
  titleCase,
  getMetadataValue,
  getResourceProperty,
  rowFilterFn,
  rowCompareFn,
  groupRows,
  getMlMetadataMetadataValue,
  getMlMetadataResourceProperty,
} from './Utils';
import { Column, Row, ExpandState } from '../components/CustomTable';
import {Artifact, Value} from '../generated/src/apis/metadata/metadata_store_pb';
import {doubleValue, intValue, stringValue} from '../TestUtils';

describe('Utils', () => {
  describe('log', () => {
    it('logs to console', () => {
      // tslint:disable-next-line:no-console
      const backup = console.log;
      global.console.log = jest.fn();
      logger.verbose('something to console');
      // tslint:disable-next-line:no-console
      expect(console.log).toBeCalledWith('something to console');
      global.console.log = backup;
    });

    it('logs to console error', () => {
      // tslint:disable-next-line:no-console
      const backup = console.error;
      global.console.error = jest.fn();
      logger.error('something to console error');
      // tslint:disable-next-line:no-console
      expect(console.error).toBeCalledWith('something to console error');
      global.console.error = backup;
    });
  });

  describe('formatDateString', () => {
    it('handles an ISO format date string', () => {
      const d = new Date(2018, 1, 13, 9, 55);
      expect(formatDateString(d.toISOString())).toBe(d.toLocaleString());
    });

    it('handles a locale format date string', () => {
      const d = new Date(2018, 1, 13, 9, 55);
      expect(formatDateString(d.toLocaleString())).toBe(d.toLocaleString());
    });

    it('handles a date', () => {
      const d = new Date(2018, 1, 13, 9, 55);
      expect(formatDateString(d)).toBe(d.toLocaleString());
    });

    it('handles undefined', () => {
      expect(formatDateString(undefined)).toBe('-');
    });
  });

  describe('titleCase', () => {
    it('Capitalizes the first letter of each word in a sentence', () => {
      expect(titleCase('this is a sentence')).toBe('This Is A Sentence');
    });

    it('Capitalizes the first letter of words seperated by non-word characters',
      () => {
        expect(titleCase('test-hyphen_underscore.period'))
          .toBe('Test Hyphen Underscore.period');
      });

    it('Returns an empty string when given an empty string',
      () => {
        expect(titleCase('')).toBe('');
      });
  });

  describe('getResourceProperty', () => {
    it('returns null if resource has no properties', () => {
      expect(getResourceProperty(new Artifact(), 'testPropName')).toBeNull();
    });

    it('returns null if resource has no custom properties', () => {
      expect(getResourceProperty(new Artifact(), 'testCustomPropName', true)).toBeNull();
    });

    it('returns null if resource has no property with the provided name', () => {
      const resource = new Artifact();
      resource.getPropertiesMap().set('somePropName', doubleValue(123));
      expect(getResourceProperty(resource, 'testPropName')).toBeNull();
    });

    it('returns if resource has no property with specified name if fromCustomProperties is false', () => {
      const resource = new Artifact();
      resource.getCustomPropertiesMap().set('testCustomPropName', doubleValue(123));
      expect(getResourceProperty(
        resource,
        'testCustomPropName',
        /* fromCustomProperties= */ false
      )).toBeNull();
    });

    it('returns if resource has no custom property with specified name if fromCustomProperties is true', () => {
      const resource = new Artifact();
      resource.getPropertiesMap().set('testPropName', doubleValue(123));
      expect(getResourceProperty(
        resource,
        'testPropName',
        /* fromCustomProperties= */ true
      )).toBeNull();
    });

    it('returns the value of the property with the provided name', () => {
      const resource = new Artifact();
      resource.getPropertiesMap().set('testPropName', doubleValue(123));
      expect(getResourceProperty(resource, 'testPropName')).toEqual(123);
    });

    it('returns the value of the custom property with the provided name', () => {
      const resource = new Artifact();
      resource.getCustomPropertiesMap().set('testCustomPropName', stringValue('abc'));
      expect(
          getResourceProperty(
              resource,
              'testCustomPropName',
              /* fromCustomProperties= */ true
          )
      ).toEqual('abc');
    });
  });

  describe('getMlMetadataResourceProperty', () => {
    it('returns null if resource has no properties', () => {
      expect(getMlMetadataResourceProperty({}, 'testPropName')).toBeNull();
    });

    it('returns null if resource has no custom properties', () => {
      expect(getMlMetadataResourceProperty({}, 'testCustomPropName', true)).toBeNull();
    });

    it('returns null if resource has no property with the provided name', () => {
      expect(getMlMetadataResourceProperty(
          {
            properties: {
              'somePropName': {
                double_value: 123,
              },
            },
          },
          'testPropName'
      )).toBeNull();
    });

    it('returns if resource has no property with specified name if fromCustomProperties is false', () => {
      expect(getMlMetadataResourceProperty(
          {
            custom_properties: {
              'testCustomPropName': {
                double_value: 123,
              },
            },
          },
          'testCustomPropName',
          false // fromCustomProperties
      )).toBeNull();
    });


    it('returns if resource has no custom property with specified name if fromCustomProperties is true', () => {
      expect(getMlMetadataResourceProperty(
          {
            properties: {
              'testPropName': {
                double_value: 123,
              },
            },
          },
          'testPropName',
          true // fromCustomProperties
      )).toBeNull();
    });

    it('returns the value of the property with the provided name', () => {
      expect(getMlMetadataResourceProperty(
          {
            properties: {
              'testPropName': {
                double_value: 123,
              },
            },
          },
          'testPropName',
      )).toEqual(123);
    });

    it('returns the value of the custom property with the provided name', () => {
      expect(getMlMetadataResourceProperty(
          {
            custom_properties: {
              'testCustomPropName': {
                string_value: 'abc',
              },
            },
          },
          'testCustomPropName',
          true
      )).toEqual('abc');
    });
  });

  describe('getMetadataValue', () => {
    it('returns a value of type double', () => {
      expect(getMetadataValue(doubleValue(123))).toEqual(123);
    });

    it('returns a value of type int', () => {
      expect(getMetadataValue(intValue(123))).toEqual(123);
    });

    it('returns a value of type string', () => {
      expect(getMetadataValue(stringValue('abc'))).toEqual('abc');
    });

    it('returns an empty string if Value has no value', () => {
      expect(getMetadataValue(new Value())).toEqual('');
    });
  });

  describe('getMlMetadataMetadataValue', () => {
    it('returns a value of type double', () => {
      expect(getMlMetadataMetadataValue({ double_value: 123 })).toEqual(123);
    });

    it('returns a value of type int', () => {
      // Swagger takes a int64 type from a .proto and converts it to string in Typescript
      expect(getMlMetadataMetadataValue({ int_value: '123' })).toEqual('123');
    });

    it('returns a value of type string', () => {
      expect(getMlMetadataMetadataValue({ string_value: 'abc' })).toEqual('abc');
    });

    it('returns an empty string if MlMetadataValue has no value', () => {
      expect(getMlMetadataMetadataValue({})).toEqual('');
    });
  });

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
