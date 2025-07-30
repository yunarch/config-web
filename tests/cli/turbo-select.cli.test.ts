import { describe, expect, it } from 'vitest';
import { turboSelectExecutor } from '../test-utils';

describe('turbo-select', () => {
  it('should fail and throw an error with missing required options', async () => {
    await expect(turboSelectExecutor()).rejects.toThrow(
      "error: required option '--run <script>' not specified"
    );
  });
});
