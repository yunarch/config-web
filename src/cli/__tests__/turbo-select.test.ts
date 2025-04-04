import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const CLI_PATH = './src/cli/turbo-select.ts';
const run = async (params: string[] = []) => {
  return promisify(exec)(`bun ${CLI_PATH} ${params.join(' ')}`);
};

describe('turbo-select', () => {
  it('should fail and throw an error with missing required options', async () => {
    await expect(run()).rejects.toThrow(
      "error: required option '--run <script>' not specified"
    );
  });
});
