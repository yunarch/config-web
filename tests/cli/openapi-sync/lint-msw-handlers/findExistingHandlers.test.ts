import { describe, expect, it, vi } from 'vitest';
import { findExistingHandlers } from '../../../../src/cli/openapi-sync/lint-msw-handlers/findExistingHandlers';

describe('openapi-sync-lint-msw-handlers findExistingHandlers', () => {
  it('should throw an error if the MSW setup constant is not found', async () => {
    vi.doMock('/path/to/msw-setup-missing-const.ts', () => ({}));
    await expect(
      findExistingHandlers({
        mswSetupFilePath: '/path/to/msw-setup-missing-const.ts',
        mswSetupConst: 'handlers',
      })
    ).rejects.toThrow('MSW setup constant not found in the setup file');
  });

  it('should throw an error if the MSW setup constant does not have a listHandlers method', async () => {
    vi.doMock('/path/to/msw-setup-missing-method.ts', () => ({
      handlers: {},
    }));
    await expect(
      findExistingHandlers({
        mswSetupFilePath: '/path/to/msw-setup-missing-method.ts',
        mswSetupConst: 'handlers',
      })
    ).rejects.toThrow(
      'MSW setup constant does not have a listHandlers() method'
    );
  });

  it('should find and transform existing handlers correctly', async () => {
    vi.doMock('/path/to/msw-setup.ts', () => ({
      handlers: {
        listHandlers: () => [
          { info: { method: 'GET', path: '/api/users/:id' } },
          { info: { method: 'POST', path: '/api/users' } },
          { info: { method: 'PUT', path: '/api/users/:id' } },
          { info: { method: 'DELETE', path: '/api/users/:id' } },
          { info: { method: 'GET', path: '/api/posts' } },
          {},
          { info: { method: 'GET' } },
          { info: { path: '/api/comments' } },
        ],
      },
    }));
    const result = await findExistingHandlers({
      mswSetupFilePath: '/path/to/msw-setup.ts',
      mswSetupConst: 'handlers',
    });
    expect(result.size).toBe(5);
    expect(result.has('GET:/api/users/{id}')).toBe(true);
    expect(result.has('POST:/api/users')).toBe(true);
    expect(result.has('PUT:/api/users/{id}')).toBe(true);
    expect(result.has('DELETE:/api/users/{id}')).toBe(true);
    expect(result.has('GET:/api/posts')).toBe(true);
    expect(result.has('GET:/api/comments')).toBe(false);
    expect(result.get('GET:/api/users/{id}')).toEqual({
      path: '/api/users/:id',
      httpMethod: 'GET',
      url: '/api/users/{id}',
    });
  });
});
