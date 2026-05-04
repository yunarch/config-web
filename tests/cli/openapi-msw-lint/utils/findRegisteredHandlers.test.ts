import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findRegisteredHandlers } from '../../../../src/cli/openapi-msw-lint/utils/findRegisteredHandlers';

vi.mock('node:url', () => ({
  pathToFileURL: (p: string) => ({ href: p }),
}));

describe('openapi-msw-lint findRegisteredHandlers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should throw if no export has listHandlers()', async () => {
    vi.doMock('/path/to/msw-no-listHandlers.ts', () => ({
      something: { foo: 'bar' },
    }));
    await expect(
      findRegisteredHandlers('/path/to/msw-no-listHandlers.ts')
    ).rejects.toThrow(
      'No export with a listHandlers() method found in the MSW setup file'
    );
  });

  it('should auto-detect the export with listHandlers()', async () => {
    vi.doMock('/path/to/msw-auto.ts', () => ({
      notThis: { foo: 'bar' },
      server: {
        listHandlers: () => [
          { info: { method: 'GET', path: '/api/users/:id' } },
        ],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-auto.ts');
    expect(result.length).toBe(1);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/users/{id}')
    ).toBe(true);
  });

  it('should find and transform registered handlers correctly', async () => {
    vi.doMock('/path/to/msw-setup.ts', () => ({
      server: {
        listHandlers: () => [
          { info: { method: 'GET', path: '/api/users/:id' } },
          { info: { method: 'POST', path: '/api/users' } },
          { info: { method: 'PUT', path: '/api/users/:id' } },
          { info: { method: 'DELETE', path: '/api/users/:id' } },
          { info: { method: 'GET', path: '/api/posts' } },
        ],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-setup.ts');
    expect(result.length).toBe(5);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/users/{id}')
    ).toBe(true);
    expect(
      result.some((h) => h.httpMethod === 'POST' && h.url === '/api/users')
    ).toBe(true);
    expect(
      result.some((h) => h.httpMethod === 'PUT' && h.url === '/api/users/{id}')
    ).toBe(true);
    expect(
      result.some(
        (h) => h.httpMethod === 'DELETE' && h.url === '/api/users/{id}'
      )
    ).toBe(true);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/posts')
    ).toBe(true);
    expect(
      result.find((h) => h.httpMethod === 'GET' && h.url === '/api/users/{id}')
    ).toEqual({
      httpMethod: 'GET',
      url: '/api/users/{id}',
    });
  });

  it('should skip handlers without info', async () => {
    vi.doMock('/path/to/msw-no-info.ts', () => ({
      server: {
        listHandlers: () => [{}, { info: { method: 'GET', path: '/api/ok' } }],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-no-info.ts');
    expect(result.length).toBe(1);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/ok')
    ).toBe(true);
  });

  it('should skip handlers with non-string path (WebSocket/custom predicate)', async () => {
    vi.doMock('/path/to/msw-websocket.ts', () => ({
      server: {
        listHandlers: () => [
          { info: { method: 'GET', path: () => true } },
          { info: { method: 'GET', path: '/api/valid' } },
        ],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-websocket.ts');
    expect(result.length).toBe(1);
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/valid')
    ).toBe(true);
  });

  it('should skip handlers without method', async () => {
    vi.doMock('/path/to/msw-no-method.ts', () => ({
      server: {
        listHandlers: () => [
          { info: { path: '/api/no-method' } },
          { info: { method: 'POST', path: '/api/with-method' } },
        ],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-no-method.ts');
    expect(result.length).toBe(1);
    expect(
      result.some(
        (h) => h.httpMethod === 'POST' && h.url === '/api/with-method'
      )
    ).toBe(true);
  });

  it('should normalize method to uppercase', async () => {
    vi.doMock('/path/to/msw-lowercase.ts', () => ({
      server: {
        listHandlers: () => [{ info: { method: 'get', path: '/api/lower' } }],
      },
    }));
    const result = await findRegisteredHandlers('/path/to/msw-lowercase.ts');
    expect(
      result.some((h) => h.httpMethod === 'GET' && h.url === '/api/lower')
    ).toBe(true);
  });
});
