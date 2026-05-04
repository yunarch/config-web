import { describe, expect, it } from 'vitest';
import { displayResults } from '../../../../src/cli/openapi-msw-lint/utils/displayResults';
import { consoleMock } from '../../../vitest.setup';

// Helper function to get all console output as a single string
const getAllOutput = () => {
  return consoleMock.mock.calls.map((c) => c.join('')).join('\n');
};

// Tests
describe('openapi-msw-lint displayResults', () => {
  it('should display success message when no missing handlers and no disconnected', () => {
    displayResults([], []);
    const output = getAllOutput();
    expect(output).toContain('No missing handlers found');
  });

  it('should display missing handlers', () => {
    displayResults(
      [
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
          suggestedPath:
            'src/mocks/handlers/services/UserService/getUserById.ts',
        },
      ],
      []
    );
    const output = getAllOutput();
    expect(output).toContain('Missing handlers (1)');
    expect(output).toContain('UserService');
    expect(output).toContain('src/services/UserService.ts');
    expect(output).toContain('GET');
    expect(output).toContain('/api/users/{id}');
    expect(output).toContain('Used in:');
    expect(output).toContain('src/components/UserProfile.tsx');
    expect(output).toContain('src/pages/UserPage.tsx');
    expect(output).toContain('Suggested handler:');
    expect(output).toContain(
      'src/mocks/handlers/services/UserService/getUserById.ts'
    );
    expect(output).toContain('1 missing handler');
  });

  it('should display multiple missing handlers grouped by service', () => {
    displayResults(
      [
        {
          type: 'missing_handler',
          service: {
            name: 'UserService',
            path: 'src/services/UserService.ts',
            methodName: 'getUserById',
            toHandleHttpMethod: 'GET',
            toHandleUrl: '/api/users/{id}',
          },
          usedIn: ['src/pages/UserPage.tsx'],
          suggestedPath:
            'src/mocks/handlers/services/UserService/getUserById.ts',
        },
        {
          type: 'missing_handler',
          service: {
            name: 'UserService',
            path: 'src/services/UserService.ts',
            methodName: 'createUser',
            toHandleHttpMethod: 'POST',
            toHandleUrl: '/api/users',
          },
          usedIn: ['src/pages/CreateUser.tsx'],
          suggestedPath:
            'src/mocks/handlers/services/UserService/createUser.ts',
        },
      ],
      []
    );
    const output = getAllOutput();
    expect(output).toContain('Missing handlers (2)');
    expect(output).toContain('GET');
    expect(output).toContain('POST');
    expect(output).toContain('2 missing handlers');
  });

  it('should display disconnected handlers', () => {
    displayResults(
      [],
      [
        {
          type: 'disconnected_handler',
          handler: {
            httpMethod: 'DELETE',
            url: '/api/users/{id}',
            filePath: 'src/mocks/handlers/UserService/deleteUser.ts',
          },
        },
      ]
    );
    const output = getAllOutput();
    expect(output).not.toContain('Missing handlers');
    expect(output).toContain('Disconnected handlers (1)');
    expect(output).toContain('DELETE');
    expect(output).toContain('/api/users/{id}');
    expect(output).toContain('not registered in MSW setup');
    expect(output).toContain('src/mocks/handlers/UserService/deleteUser.ts');
    expect(output).toContain('1 disconnected handler');
  });

  it('should display both missing and disconnected handlers', () => {
    displayResults(
      [
        {
          type: 'missing_handler',
          service: {
            name: 'PetService',
            path: 'src/services/PetService.ts',
            methodName: 'getPetById',
            toHandleHttpMethod: 'GET',
            toHandleUrl: '/pet/{petId}',
          },
          usedIn: ['src/pages/PetDetail.tsx'],
          suggestedPath: 'src/mocks/handlers/services/PetService/getPetById.ts',
        },
      ],
      [
        {
          type: 'disconnected_handler',
          handler: {
            httpMethod: 'DELETE',
            url: '/pet/{petId}',
            filePath: 'src/mocks/handlers/PetService/deletePet.ts',
          },
        },
      ]
    );
    const output = getAllOutput();
    expect(output).toContain('Missing handlers (1)');
    expect(output).toContain('Disconnected handlers (1)');
    expect(output).toContain('1 missing handler');
    expect(output).toContain('1 disconnected handler');
  });

  it('should display multiple disconnected handlers', () => {
    displayResults(
      [],
      [
        {
          type: 'disconnected_handler',
          handler: {
            httpMethod: 'PUT',
            url: '/api/items/{id}',
            filePath: 'src/handlers/updateItem.ts',
          },
        },
        {
          type: 'disconnected_handler',
          handler: {
            httpMethod: 'PATCH',
            url: '/api/items/{id}',
            filePath: 'src/handlers/patchItem.ts',
          },
        },
      ]
    );
    const output = getAllOutput();
    expect(output).toContain('Disconnected handlers (2)');
    expect(output).toContain('2 disconnected handlers');
  });
});
