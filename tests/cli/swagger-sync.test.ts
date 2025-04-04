import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const CLI_PATH = './src/cli/swagger-sync.ts';
const run = async (params: string[] = []) => {
  return promisify(exec)(`bun ${CLI_PATH} ${params.join(' ')}`);
};

describe('swagger-sync', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(run()).rejects.toThrow(
        "error: required option '--url <url>' not specified"
      ),
      expect(run(['--url https://swagger.example'])).rejects.toThrow(
        "error: required option '--output <path>' not specified"
      ),
      expect(
        run(['--url https://swagger.example', '--output ./gen'])
      ).rejects.toThrow(
        "error: required option '--models-folder <path>' not specified"
      ),
    ]);
  });
});
