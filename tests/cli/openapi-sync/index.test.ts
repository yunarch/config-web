import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { TEMPLATE } from '../../../src/cli/openapi-sync/codegen-msw-utils/openapi-msw-http';
import { createCliExecutor, createRelativeResolver } from '../../test-utils';

const resolve = createRelativeResolver(import.meta.url);
const run = createCliExecutor(
  resolve('../../../src/cli/openapi-sync/index.ts')
);
const INPUT_PATH = resolve('./mocks/input-openapi.json');

vi.mock('ora', () => {
  return {
    default: vi.fn(() => ({
      start: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    })),
  };
});

describe('openapi-sync', () => {
  const testDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'tmp'
  );

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    await run([`-i ${INPUT_PATH} -o ${testDir} -f --include-msw-utils`]);
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it.concurrent(
    'should fail and throw an error with missing required options',
    async ({ expect }) => {
      await Promise.all([
        expect(run()).rejects.toThrowError(
          "error: required option '-i, --input <path>' not specified"
        ),
        expect(run(['-i https://swagger.example'])).rejects.toThrowError(
          "error: required option '-o, --output <folder>' not specified"
        ),
      ]);
    }
  );

  it.concurrent('should fail with wrong output type', async ({ expect }) => {
    await expect(
      run([`-i https://swagger.example -o ./tmp/openapi.json`])
    ).rejects.toThrowError('error: Output must be a directory.');
  });

  it.concurrent('should fail with wrong input type', async ({ expect }) => {
    await Promise.all([
      expect(run([`-i https://swagger.example -o ./tmp`])).rejects.toThrowError(
        'error: Input file must be a JSON file'
      ),
      expect(run([`-i https://swagger.json -o ./tmp`])).rejects.toThrowError(
        'Failed to fetch remote OpenAPI file'
      ),
      expect(run([`-i ./openapi.json -o ./tmp`])).rejects.toThrowError(
        'Input file does not exist'
      ),
    ]);
  });

  it.concurrent('should create `openapi.json` file', ({ expect }) => {
    expect(existsSync(`${testDir}/openapi.json`)).toBe(true);
  });

  it.concurrent('should create `schema.d.ts` file', ({ expect }) => {
    expect(existsSync(`${testDir}/schema.d.ts`)).toBe(true);
  });

  it.concurrent(
    'should create `openapi-msw-http.ts` file with correct content',
    async ({ expect }) => {
      await expect(
        readFile(path.join(testDir, 'openapi-msw-http.ts'), 'utf8')
      ).resolves.toBe(TEMPLATE);
    }
  );
});
