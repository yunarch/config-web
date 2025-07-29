import { describe, expect, it } from 'vitest';
import { createCliExecutor, createRelativeResolver } from '../../test-utils';

const resolve = createRelativeResolver(import.meta.url);
const run = createCliExecutor(
  resolve('../../../src/cli/turbo-select/index.ts')
);

describe('turbo-select', () => {
  it('should fail and throw an error with missing required options', async () => {
    await expect(run()).rejects.toThrow(
      "error: required option '--run <script>' not specified"
    );
  });
});
