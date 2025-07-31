import { describe, expect, it } from 'vitest';
import { bunRunAllExecutor } from '../../test-utils';

describe('bun-run-all', () => {
  it('should fail and throw an error with missing required options', async () => {
    await expect(bunRunAllExecutor()).rejects.toThrow(
      "error: missing required argument 'scripts'"
    );
  });

  it('should fail if both --parallel and --sequential options are used', async () => {
    await expect(
      bunRunAllExecutor(['--parallel', '--sequential', 'some-script'])
    ).rejects.toThrow(
      'You cannot use both --parallel and --sequential options at the same time'
    );
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await bunRunAllExecutor(['--help']);
    expect(stdout).toContain('Usage: bun-run-all [options] <scripts...>');
    expect(stdout).toContain('-p, --parallel');
    expect(stdout).toContain('-s, --sequential');
    expect(stdout).toContain('-c, --continue-on-error');
    expect(stdout).toContain('-t, --time');
  });
});
