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
} from './Utils';

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
});
