import { execFile } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bunRunAllExecutor, createRelativeResolver } from '../../test-utils';

const resolve = createRelativeResolver(import.meta.url);
const INPUT_PACKAGE_JSON = resolve('package.json');

describe('bun-run-all', () => {
  beforeAll(async () => {
    const packageJson = {
      name: 'bun-run-all-test-package',
      version: '1.0.0',
      scripts: {
        'test-success-1': 'exit 0',
        'test-success-2': 'exit 0',
        'test-failure': `exit 1`,
      },
    };
    await writeFile(INPUT_PACKAGE_JSON, JSON.stringify(packageJson, null, 2));
  });

  afterAll(async () => {
    await rm(INPUT_PACKAGE_JSON, { force: true });
  });

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

  it('run utils.test.bun.ts with bun test runner', async () => {
    // stderr -> Status messages, test runner summaries, warnings, etc.
    const { stderr } = await promisify(execFile)(
      'bun',
      ['test', './utils.test.bun.ts'],
      { cwd: resolve('.') }
    );
    expect(stderr).toContain('0 fail');
  });
});
