import { describe, expect, it } from 'vitest';
import { openapiSyncLintMswHandlersExecutor } from '../../test-utils';

describe('openapi-sync-lint-msw-handlers', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(openapiSyncLintMswHandlersExecutor()).rejects.toThrow(
        "error: required option '--gen <path>' not specified"
      ),
      expect(
        openapiSyncLintMswHandlersExecutor(['--gen gen'])
      ).rejects.toThrowError(
        "error: required option '--msw-setup-file <path>' not specified"
      ),
      expect(
        openapiSyncLintMswHandlersExecutor([
          '--gen gen --msw-setup-file server.ts',
        ])
      ).rejects.toThrowError(
        "error: required option '--msw-setup-const <const>' not specified"
      ),
    ]);
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await openapiSyncLintMswHandlersExecutor(['--help']);
    expect(stdout).toContain('Usage: openapi-sync-lint-msw-handlers [options]');
    expect(stdout).toContain('--gen <path>');
    expect(stdout).toContain('--msw-setup-file <path>');
    expect(stdout).toContain('--msw-setup-const <const>');
  });
});
