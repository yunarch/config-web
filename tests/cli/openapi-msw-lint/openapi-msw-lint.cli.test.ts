import { describe, expect, it } from 'vitest';
import { openapiMswLintExecutor } from '../../test-utils';

describe('openapi-msw-lint', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(openapiMswLintExecutor()).rejects.toThrow(
        "error: required option '--gen <path>' not specified"
      ),
      expect(openapiMswLintExecutor(['--gen gen'])).rejects.toThrowError(
        "error: required option '--msw-setup-file <path>' not specified"
      ),
      expect(
        openapiMswLintExecutor(['--gen gen --msw-setup-file server.ts'])
      ).rejects.toThrowError(
        "error: required option '--msw-setup-const <const>' not specified"
      ),
    ]);
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await openapiMswLintExecutor(['--help']);
    expect(stdout).toContain('Usage: openapi-msw-lint [options]');
    expect(stdout).toContain('--gen <path>');
    expect(stdout).toContain('--msw-setup-file <path>');
    expect(stdout).toContain('--msw-setup-const <const>');
  });
});
