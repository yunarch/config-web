import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findExistingHandlers } from '../../../../src/cli/openapi-msw-lint/utils/findExistingHandlers';
import { MSW_HANDLERS_FIXTURES, OPENAPI_GEN_OUTPUT } from '../../../test-utils';

describe('openapi-msw-lint findExistingHandlers', () => {
  it('should return an empty array when no handler files exist in directory', async () => {
    const result = await findExistingHandlers({
      srcPath: OPENAPI_GEN_OUTPUT,
      genPath: OPENAPI_GEN_OUTPUT,
    });
    expect(result.length).toBe(0);
  });

  it('should find handlers from openapi-msw-http, native MSW and aliased imports', async () => {
    const result = await findExistingHandlers({
      srcPath: MSW_HANDLERS_FIXTURES,
      genPath: OPENAPI_GEN_OUTPUT,
    });
    // All handlers must include an absolute filePath
    for (const handler of result) {
      expect(handler.filePath).toBeDefined();
      expect(path.isAbsolute(handler.filePath)).toBe(true);
    }
    // Check specific handlers from each fixture file are found with correct keys and metadata
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/pet/{petId}')
    ).toBe(true);
    expect(
      result.find((h) => h.httpMethod === 'GET' && h.url === '/pet/{petId}')
    ).toEqual(
      expect.objectContaining({
        httpMethod: 'GET',
        url: '/pet/{petId}',
      })
    );
    expect(
      result.some(
        (h) => h.httpMethod === 'GET' && h.url === '/pet/findByStatus'
      )
    ).toBe(true);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/users/{id}')
    ).toBe(true);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/orders')
    ).toBe(true);
    // no-msw-handler.ts: files without MSW imports must not contribute handlers
    for (const handler of result) {
      expect(handler.filePath).not.toContain('no-msw-handler.ts');
    }
  });
});
