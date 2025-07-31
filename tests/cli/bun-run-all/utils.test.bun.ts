import { afterEach } from 'node:test';
import { describe, expect, it, vi } from 'vitest';
import { runParallel, runSequential } from '../../../src/cli/bun-run-all/utils';

const consoleMock = vi.spyOn(console, 'log').mockImplementation(vi.fn());

describe('bun-run-all utils', () => {
  afterEach(() => {
    consoleMock.mockClear();
  });

  // Test cases for runParallel function
  describe('runParallel', () => {
    it('should return exit code 0 when all succeed', async () => {
      const exitCode = await runParallel(['test-success-1'], {
        continueOnError: true,
        reportTime: false,
      });
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(0);
      expect(log).toContain('test-success-1:');
      expect(log).toContain('1 successful');
      expect(log).toContain('-- 1 total');
    });

    it('should return exit code 0 when all succeed with time', async () => {
      const exitCode = await runParallel(['test-success-1', 'test-success-2'], {
        continueOnError: true,
        reportTime: true,
      });
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(0);
      expect(log).toContain('test-success-1:');
      expect(log).toContain('test-success-2:');
      expect(log).toContain('2 successful');
      expect(log).toContain('-- 2 total');
      expect(log).toContain('Finished in');
    });

    it('should return non-zero exit code when any script fails', async () => {
      const exitCode = await runParallel(['test-failure', 'test-success-1'], {
        continueOnError: true,
        reportTime: false,
      });
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(1);
      expect(log).toContain('test-failure:');
      expect(log).toContain('test-success-1:');
      expect(log).toContain('1 failed');
      expect(log).toContain('1 successful');
      expect(log).toContain('-- 2 total');
    });
  });

  // Test cases for runSequential function
  describe('runSequential', () => {
    it('should return exit code 0 when all succeed', async () => {
      const exitCode = await runSequential(
        ['test-success-1', 'test-success-2'],
        {
          continueOnError: true,
          reportTime: false,
        }
      );
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(0);
      expect(consoleMock.mock.calls[0].join('')).toContain('test-success-1:');
      expect(consoleMock.mock.calls[2].join('')).toContain('test-success-2:');
      expect(log).toContain('2 successful');
      expect(log).toContain('-- 2 total');
    });

    it('should return exit code 0 when all succeed with time', async () => {
      const exitCode = await runSequential(
        ['test-success-1', 'test-success-2'],
        {
          continueOnError: true,
          reportTime: true,
        }
      );
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(0);
      expect(consoleMock.mock.calls[0].join('')).toContain('test-success-1:');
      expect(consoleMock.mock.calls[2].join('')).toContain('Finished in');
      expect(consoleMock.mock.calls[3].join('')).toContain('test-success-2:');
      expect(consoleMock.mock.calls[5].join('')).toContain('Finished in');
      expect(log).toContain('2 successful');
      expect(log).toContain('-- 2 total');
    });

    it('should return non-zero exit code when any script fails', async () => {
      const exitCode = await runSequential(['test-failure', 'test-success-1'], {
        continueOnError: true,
        reportTime: false,
      });
      const log = consoleMock.mock.calls.join('');
      expect(exitCode).toBe(1);
      expect(consoleMock.mock.calls[0].join('')).toContain('test-failure:');
      expect(consoleMock.mock.calls[2].join('')).toContain('error');
      expect(consoleMock.mock.calls[4].join('')).toContain('test-success-1:');
      expect(log).toContain('1 successful');
      expect(log).toContain('-- 2 total');
    });
  });
});
