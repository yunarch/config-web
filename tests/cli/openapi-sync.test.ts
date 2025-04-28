import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { TEMPLATE } from '../../src/cli/openapi-sync/codegen-msw-utils/openapi-msw-http';
import { createCliExecutor, createRelativeResolver } from '../test-utils';

const resolve = createRelativeResolver(import.meta.url);
const run = createCliExecutor(resolve('../../src/cli/openapi-sync/index.ts'));
const INPUT_PATH = resolve('./mocks/openapi-sync-input.json');
const OUTPUT_PATH = resolve('./tmp');

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
  beforeAll(async () => {
    await run([`-i ${INPUT_PATH} -o ${OUTPUT_PATH} -f --include-msw-utils`]);
  }, 15_000);

  afterAll(async () => {
    await rm(OUTPUT_PATH, { recursive: true, force: true });
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
      expect(
        run([`-i https://swagger.example -o ${OUTPUT_PATH}`])
      ).rejects.toThrowError('error: Input file must be a JSON file'),
      expect(
        run([`-i https://swagger.json -o ${OUTPUT_PATH}`])
      ).rejects.toThrowError('Failed to fetch remote OpenAPI file'),
      expect(run([`-i ./openapi.json -o ${OUTPUT_PATH}`])).rejects.toThrowError(
        'Input file does not exist'
      ),
    ]);
  });

  it.concurrent('should create `openapi.json` file', ({ expect }) => {
    expect(existsSync(`${OUTPUT_PATH}/openapi.json`)).toBe(true);
  });

  it.concurrent('should create `schema.d.ts` file', ({ expect }) => {
    expect(existsSync(`${OUTPUT_PATH}/schema.d.ts`)).toBe(true);
  });

  it.concurrent(
    'should create `openapi-msw-http.ts` file with correct content',
    async ({ expect }) => {
      await expect(
        readFile(path.join(OUTPUT_PATH, 'openapi-msw-http.ts'), 'utf8')
      ).resolves.toBe(TEMPLATE);
    }
  );
});
