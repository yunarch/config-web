import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OPENAPI_SYNC_OUTPUT, openapiSyncExecutor } from '../../test-utils';

describe('openapi-sync', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(openapiSyncExecutor()).rejects.toThrowError(
        "error: required option '-i, --input <path>' not specified"
      ),
      expect(
        openapiSyncExecutor(['-i https://swagger.example'])
      ).rejects.toThrowError(
        "error: required option '-o, --output <folder>' not specified"
      ),
    ]);
  });

  it('should fail with wrong output type', async () => {
    await expect(
      openapiSyncExecutor([`-i https://swagger.example -o ./tmp/openapi.json`])
    ).rejects.toThrowError('error: Output must be a directory.');
  });

  it('should fail with wrong input type', async () => {
    await Promise.all([
      expect(
        openapiSyncExecutor([
          `-i https://swagger.example -o ${OPENAPI_SYNC_OUTPUT}`,
        ])
      ).rejects.toThrowError('error: Input file must be a JSON file'),
      expect(
        openapiSyncExecutor([
          `-i https://swagger.json -o ${OPENAPI_SYNC_OUTPUT}`,
        ])
      ).rejects.toThrowError('Failed to fetch remote OpenAPI file'),
      expect(
        openapiSyncExecutor([`-i ./openapi.json -o ${OPENAPI_SYNC_OUTPUT}`])
      ).rejects.toThrowError('Input file does not exist'),
    ]);
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await openapiSyncExecutor(['--help']);
    expect(stdout).toContain('Usage: openapi-sync [options]');
    expect(stdout).toContain('-i, --input <path>');
    expect(stdout).toContain('-o, --output <folder>');
    expect(stdout).toContain('-f, --force-gen');
    expect(stdout).toContain('--include-msw-utils');
    expect(stdout).toContain('--post-script <script>');
  });

  it('vitest global setup `openapi-sync` should have created `openapi.json` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/openapi.json`)).toBe(true);
  });

  it('vitest global setup `openapi-sync` should have created `schema.d.ts` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/schema.d.ts`)).toBe(true);
  });

  it('vitest global setup `openapi-sync` should have created `openapi-msw-http.ts` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/openapi-msw-http.ts`)).toBe(true);
  });
});
