import { describe, expect, it } from 'vitest';
import { turboSelectExecutor } from '../../test-utils';

describe('turbo-select', () => {
  it('should fail and throw an error with missing required options', async () => {
    await expect(turboSelectExecutor()).rejects.toThrow(
      "error: required option '--run <script>' not specified"
    );
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await turboSelectExecutor(['--help']);
    expect(stdout).toContain('Usage: turbo-select [options]');
    expect(stdout).toContain('--run <script>');
    expect(stdout).toContain('--select-env');
  });
});
