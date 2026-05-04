import { describe, expect, it } from 'vitest';
import type { ExistingHandler } from '../../../../src/cli/openapi-msw-lint/utils/findExistingHandlers';
import type { RegisteredHandler } from '../../../../src/cli/openapi-msw-lint/utils/findRegisteredHandlers';
import { getDisconnectedHandlers } from '../../../../src/cli/openapi-msw-lint/utils/getDisconnectedHandlers';

describe('openapi-msw-lint getDisconnectedHandlers', () => {
  it('should return empty array when both maps are empty', () => {
    expect(getDisconnectedHandlers([], [])).toEqual([]);
  });

  it('should return empty array when all existing handlers are registered', () => {
    const existing: ExistingHandler[] = [
      {
        httpMethod: 'GET',
        url: '/api/users/{id}',
        filePath: '/handlers/getUser.ts',
        isRuntimeOverride: false,
      },
    ];
    const registered: RegisteredHandler[] = [
      { httpMethod: 'GET', url: '/api/users/{id}' },
    ];
    expect(getDisconnectedHandlers(existing, registered)).toEqual([]);
  });

  it('should return disconnected handlers not found in registered map', () => {
    const existing: ExistingHandler[] = [
      {
        httpMethod: 'GET',
        url: '/api/users/{id}',
        filePath: '/handlers/getUser.ts',
        isRuntimeOverride: false,
      },
      {
        httpMethod: 'DELETE',
        url: '/api/users/{id}',
        filePath: '/handlers/deleteUser.ts',
        isRuntimeOverride: false,
      },
    ];
    const registered: RegisteredHandler[] = [
      { httpMethod: 'GET', url: '/api/users/{id}' },
    ];
    const result = getDisconnectedHandlers(existing, registered);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'disconnected_handler',
      handler: {
        httpMethod: 'DELETE',
        url: '/api/users/{id}',
        filePath: '/handlers/deleteUser.ts',
        isRuntimeOverride: false,
      },
    });
  });

  it('should return all existing handlers when registered map is empty', () => {
    const existing: ExistingHandler[] = [
      {
        httpMethod: 'GET',
        url: '/api/users',
        filePath: '/handlers/listUsers.ts',
        isRuntimeOverride: false,
      },
      {
        httpMethod: 'POST',
        url: '/api/users',
        filePath: '/handlers/createUser.ts',
        isRuntimeOverride: false,
      },
    ];
    const result = getDisconnectedHandlers(existing, []);
    expect(result).toHaveLength(2);
  });

  it('should match handlers with wildcard prefix in registered map', () => {
    const existing: ExistingHandler[] = [
      {
        httpMethod: 'GET',
        url: '/api/users/{id}',
        filePath: '/handlers/getUser.ts',
        isRuntimeOverride: false,
      },
    ];
    const registered: RegisteredHandler[] = [
      { httpMethod: 'GET', url: '*/api/users/{id}' },
    ];
    expect(getDisconnectedHandlers(existing, registered)).toEqual([]);
  });

  it('should skip runtime override handlers (server.use())', () => {
    const existing: ExistingHandler[] = [
      {
        httpMethod: 'GET',
        url: '/api/users/{id}',
        filePath: '/handlers/getUser.ts',
        isRuntimeOverride: false,
      },
      {
        httpMethod: 'POST',
        url: '/api/users',
        filePath: '/test/overrides.ts',
        isRuntimeOverride: true,
      },
    ];
    const registered: RegisteredHandler[] = [
      { httpMethod: 'GET', url: '/api/users/{id}' },
    ];
    // The runtime override handler should not be flagged as disconnected
    const result = getDisconnectedHandlers(existing, registered);
    expect(result).toEqual([]);
  });
});
