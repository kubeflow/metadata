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
} from './Utils';
import { Row, Column } from '../components/CustomTable';

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
      expect(getResourceProperty({}, 'testPropName')).toBeNull();
    });

    it('returns null if resource has no custom properties', () => {
      expect(getResourceProperty({}, 'testCustomPropName', true)).toBeNull();
    });

    it('returns null if resource has no property with the provided name', () => {
      expect(getResourceProperty(
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
      expect(getResourceProperty(
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
      expect(getResourceProperty(
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
      expect(getResourceProperty(
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
      expect(getResourceProperty(
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
      expect(getMetadataValue({ double_value: 123 })).toEqual(123);
    });

    it('returns a value of type int', () => {
      // Swagger takes a int64 type from a .proto and converts it to string in Typescript
      expect(getMetadataValue({ int_value: '123' })).toEqual('123');
    });

    it('returns a value of type string', () => {
      expect(getMetadataValue({ string_value: 'abc' })).toEqual('abc');
    });

    it('returns an empty string if MlMetadataValue has no value', () => {
      expect(getMetadataValue({})).toEqual('');
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
    // const getTestRows: () => Row[] = () => {
    //   return [
    //     {
    //       id: 'dataset:1',
    //       otherFields: ['pipelineName-1', 'artifactName-1', '1', 'dataset', 'uri-1']
    //     }
    //   ];
    // };
  });

  describe('getExpandedRows', () => {

  });
});
