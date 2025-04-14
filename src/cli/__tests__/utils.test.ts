import ora from 'ora';
import { describe, expect, it, vi } from 'vitest';
import { runTask } from '../utils';

vi.mock('ora', () => {
  return {
    default: vi.fn(() => ({
      start: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    })),
  };
});

describe('runTask', () => {
  it('should fail and throw an error with invalid command', async () => {
    await expect(
      runTask({
        command: 'invalid-command',
        name: 'Failing Command',
      })
    ).rejects.toThrow('Command failed');
    expect(ora).toHaveBeenCalledWith('Failing Command');
  });

  it('should execute a string command and return its output', async () => {
    const result = await runTask({
      command: 'echo Hello, World!',
      name: 'Test Command',
    });
    expect(result.trimEnd()).toBe('Hello, World!');
    expect(ora).toHaveBeenCalledWith('Test Command');
  });

  it('should execute a promise and return its resolved value', async () => {
    const mockPromise = Promise.resolve('Promise resolved');
    const result = await runTask({
      command: mockPromise,
      name: 'Test Promise',
    });
    expect(result).toBe('Promise resolved');
    expect(ora).toHaveBeenCalledWith('Test Promise');
  });

  it('should execute a function returning a promise and return its resolved value', async () => {
    const result = await runTask({
      command: () => Promise.resolve('Function resolved'),
      name: 'Test Function',
    });
    expect(result).toBe('Function resolved');
    expect(ora).toHaveBeenCalledWith('Test Function');
  });
});
