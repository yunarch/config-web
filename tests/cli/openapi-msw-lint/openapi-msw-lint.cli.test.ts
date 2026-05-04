import { describe, expect, it } from 'vitest';
import { openapiMswLintExecutor } from '../../test-utils';

describe('openapi-msw-lint', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(openapiMswLintExecutor()).rejects.toThrow(
        "error: required option '--gen <path>' not specified"
      ),
      expect(openapiMswLintExecutor(['--gen gen'])).rejects.toThrow(
        "error: required option '--msw-setup-file <path>' not specified"
      ),
    ]);
  });

  it('should fail when required paths do not exist', async () => {
    await Promise.all([
      expect(
        openapiMswLintExecutor([
          '--gen ./nonexistent/path --msw-setup-file ./tests/__mocks__/openapi-gen-input/index.ts',
        ])
      ).rejects.toThrow(
        'Generated API folder does not exist or is not a directory'
      ),
      expect(
        openapiMswLintExecutor([
          '--gen ./tests/__mocks__/openapi-gen-input --msw-setup-file ./nonexistent/file.ts',
        ])
      ).rejects.toThrow('MSW setup file does not exist or is not a file'),
    ]);
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await openapiMswLintExecutor(['--help']);
    expect(stdout).toContain('Usage: openapi-msw-lint [options]');
    expect(stdout).toContain('--gen <path>');
    expect(stdout).toContain('--msw-setup-file <path>');
  });
});
