import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OPENAPI_SYNC_OUTPUT, openapiSyncExecutor } from '../test-utils';

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

  it('should create `openapi.json` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/openapi.json`)).toBe(true);
  });

  it('should create `schema.d.ts` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/schema.d.ts`)).toBe(true);
  });

  it('should create `openapi-msw-http.ts` file', () => {
    expect(existsSync(`${OPENAPI_SYNC_OUTPUT}/openapi-msw-http.ts`)).toBe(true);
  });
});
