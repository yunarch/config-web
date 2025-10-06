import { describe, expect, it } from 'vitest';
import { displayResults } from '../../../../src/cli/openapi-sync/lint-msw-handlers/displayResults';
import { consoleMock } from '../../../vitest.setup';

describe('openapi-sync-lint-msw-handlers displayResults', () => {
  it('should display success message when no missing handlers', () => {
    displayResults([]);
    expect(consoleMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('No missing handlers found')
    );
  });

  it('should display results with correct formatting', () => {
    displayResults([
      {
        type: 'missing_handler',
        service: {
          name: 'UserService',
          path: 'src/services/UserService.ts',
          methodName: 'getUserById',
          toHandleHttpMethod: 'GET',
          toHandleUrl: '/api/users/{id}',
        },
        usedIn: ['src/components/UserProfile.tsx', 'src/pages/UserPage.tsx'],
        suggestedPath: 'src/mocks/handlers/services/UserService/getUserById.ts',
      },
    ]);
    expect(consoleMock.mock.calls[0].join('').trimStart()).toEqual(
      'UserService (src/services/UserService.ts)'
    );
    expect(consoleMock.mock.calls[1].join('').trimStart()).toEqual(
      '└─ GET /api/users/{id}'
    );
    expect(consoleMock.mock.calls[2].join('').trimStart()).toEqual(
      '├─ Used in:'
    );
    expect(consoleMock.mock.calls[3].join('').trimStart()).toEqual(
      '│   ├─ src/components/UserProfile.tsx'
    );
    expect(consoleMock.mock.calls[4].join('').trimStart()).toEqual(
      '│   └─ src/pages/UserPage.tsx'
    );
    expect(consoleMock.mock.calls[5].join('').trimStart()).toEqual(
      '└─ Suggested handler:'
    );
    expect(consoleMock.mock.calls[6].join('').trimStart()).toEqual(
      '→ src/mocks/handlers/services/UserService/getUserById.ts'
    );
  });
});
