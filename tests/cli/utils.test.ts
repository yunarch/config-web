import ora from 'ora';
import { describe, expect, it } from 'vitest';
import { runTask } from '../../src/cli/utils';
import { oraFailMock, oraSucceedMock } from '../vitest.setup';

describe('runTask', () => {
  it('should handle errors and call spinner.fail', async () => {
    await expect(
      runTask({
        command: () => {
          throw new Error('Thrown error');
        },
        name: 'Test Error',
      })
    ).rejects.toThrowError();
    expect(ora).toHaveBeenCalledExactlyOnceWith('Test Error');
    expect(oraSucceedMock).not.toHaveBeenCalled();
    expect(oraFailMock).toHaveBeenCalledExactlyOnceWith('Thrown error');
  });

  it('should execute a promise and return its resolved value', async () => {
    const result = await runTask({
      command: Promise.resolve('Promise resolved'),
      name: 'Test Promise',
    });
    expect(result).toBe('Promise resolved');
    expect(ora).toHaveBeenCalledExactlyOnceWith('Test Promise');
    expect(oraSucceedMock).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('should execute an async function and return its resolved value', async () => {
    const result = await runTask({
      command: () => Promise.resolve('Function resolved'),
      name: 'Test Promise Function',
    });
    expect(result).toBe('Function resolved');
    expect(ora).toHaveBeenCalledExactlyOnceWith('Test Promise Function');
    expect(oraSucceedMock).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('should execute a function and return its value', async () => {
    const result = await runTask({
      command: () => 'Function resolved',
      name: 'Test Function',
    });
    expect(result).toBe('Function resolved');
    expect(ora).toHaveBeenCalledExactlyOnceWith('Test Function');
    expect(oraSucceedMock).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("should show the elapsed time if 'showTime' option is true", async () => {
    const result = await runTask({
      command: () => 'Function resolved',
      name: 'Test Function with Elapsed Time',
      options: { showTime: true },
    });
    expect(result).toBe('Function resolved');
    expect(ora).toHaveBeenCalledExactlyOnceWith(
      'Test Function with Elapsed Time'
    );
    expect(oraSucceedMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/^\d+ms Test Function with Elapsed Time$/)
    );
  });
});
