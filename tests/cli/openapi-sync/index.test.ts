import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const CLI_PATH = './src/cli/openapi-sync/index.ts';
const run = async (params: string[] = []) => {
  return promisify(exec)(`bun ${CLI_PATH} ${params.join(' ')}`);
};

describe('openapi-sync', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(run()).rejects.toThrow(
        "error: required option '-i, --input <path>' not specified"
      ),
      expect(run(['-i https://swagger.example'])).rejects.toThrow(
        "error: required option '-o, --output <folder>' not specified"
      ),
    ]);
  });
});
