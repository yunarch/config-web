import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  MOCKS_PATH,
  OPENAPI_GEN_OUTPUT,
  openapiGenExecutor,
} from '../../test-utils';

describe('openapi-gen', () => {
  it('should fail and throw an error with missing required options', async () => {
    await Promise.all([
      expect(openapiGenExecutor()).rejects.toThrowError(
        "error: required option '-i, --input <path>' not specified"
      ),
      expect(
        openapiGenExecutor(['-i https://swagger.example'])
      ).rejects.toThrowError(
        "error: required option '-o, --output <folder>' not specified"
      ),
    ]);
  });

  it('should fail with wrong output type', async () => {
    await expect(
      openapiGenExecutor([`-i https://swagger.example -o ./tmp/openapi.json`])
    ).rejects.toThrowError('error: Output must be a directory.');
  });

  it('should fail with wrong input type', async () => {
    await Promise.all([
      expect(
        openapiGenExecutor([
          `-i https://swagger.example -o ${OPENAPI_GEN_OUTPUT}`,
        ])
      ).rejects.toThrowError('error: Input file must be a JSON file'),
      expect(
        openapiGenExecutor([`-i https://swagger.json -o ${OPENAPI_GEN_OUTPUT}`])
      ).rejects.toThrowError('Failed to fetch remote OpenAPI file'),
      expect(
        openapiGenExecutor([`-i ./openapi.json -o ${OPENAPI_GEN_OUTPUT}`])
      ).rejects.toThrowError('Input file does not exist'),
    ]);
  });

  it('should display help information with --help flag', async () => {
    const { stdout } = await openapiGenExecutor(['--help']);
    expect(stdout).toContain('Usage: openapi-gen [options]');
    expect(stdout).toContain('-i, --input <path>');
    expect(stdout).toContain('-o, --output <folder>');
    expect(stdout).toContain('-y, --yes');
    expect(stdout).toContain('-f, --force-gen');
    expect(stdout).toContain('--include-msw-utils');
    expect(stdout).toContain('--post-script <script>');
    expect(stdout).toContain('--verify-openapi-gen');
  });

  it('should fail with --verify-openapi-gen flag if schemas are changed', async () => {
    await expect(
      openapiGenExecutor([
        `-i ${MOCKS_PATH}/openapi-gen-input.new.json -o ${OPENAPI_GEN_OUTPUT} --verify-openapi-gen`,
      ])
    ).rejects.toThrowError();
  });

  it('vitest global setup `openapi-gen` should have created `openapi.json` file', () => {
    expect(existsSync(`${OPENAPI_GEN_OUTPUT}/openapi.json`)).toBe(true);
  });

  it('vitest global setup `openapi-gen` should have created `schema.d.ts` file', () => {
    expect(existsSync(`${OPENAPI_GEN_OUTPUT}/schema.d.ts`)).toBe(true);
  });

  it('vitest global setup `openapi-gen` should have created `openapi-msw-http.ts` file', () => {
    expect(existsSync(`${OPENAPI_GEN_OUTPUT}/openapi-msw-http.ts`)).toBe(true);
  });
});
