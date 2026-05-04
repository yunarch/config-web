import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ServiceInfo } from '../../../../src/cli/openapi-msw-lint/utils/findServicesUsages';
import {
  getMissingHandlers,
  type MissingHandlerError,
} from '../../../../src/cli/openapi-msw-lint/utils/getMissingHandlers';

// Generates a map of service usages from an array of services.
const generateServicesUsagesMapFromServices = (services: ServiceInfo[]) => {
  return new Map(
    services.map((service) => [
      service.name,
      new Map([
        [
          service.methodName,
          {
            serviceInfo: service,
            files: new Set(['/path/to/used-in-component.ts']),
          },
        ],
      ]),
    ])
  );
};

// Tests
describe('openapi-msw-lint getMissingHandlers', () => {
  it('should return an empty array when services and handlers are empty', () => {
    expect(getMissingHandlers(new Map(), [], '/path/to/handlers')).toEqual([]);
  });

  it('should return an empty array when services are empty', () => {
    expect(
      getMissingHandlers(
        new Map(),
        [
          {
            httpMethod: 'GET',
            url: '/api/users/{id}',
            filePath: '/path/to/handler.ts',
          },
        ],
        '/path/to/handlers'
      )
    ).toEqual([]);
  });

  it('should return all services as missing when existing handlers are empty', () => {
    const services: ServiceInfo[] = [
      {
        path: '/path/to/UserService.ts',
        name: 'UserService',
        methodName: 'getUserById',
        toHandleUrl: '/api/users/{id}',
        toHandleHttpMethod: 'GET',
      },
    ];
    expect(
      getMissingHandlers(
        generateServicesUsagesMapFromServices(services),
        [],
        '/path/to/handlers'
      )
    ).toEqual([
      {
        type: 'missing_handler',
        usedIn: ['/path/to/used-in-component.ts'],
        suggestedPath: path.join(
          '/path/to/handlers/handlers/services/UserService/getUserById.ts'
        ),
        service: services[0],
      },
    ] as MissingHandlerError[]);
  });

  it('should identify missing handlers', () => {
    const services: ServiceInfo[] = [
      {
        path: '/path/to/UserService.ts',
        name: 'UserService',
        methodName: 'getUserById',
        toHandleUrl: '/api/users/{id}',
        toHandleHttpMethod: 'GET',
      },
      {
        path: '/path/to/UserService.ts',
        name: 'UserService',
        methodName: 'createUser',
        toHandleUrl: '/api/users',
        toHandleHttpMethod: 'POST',
      },
    ];
    expect(
      getMissingHandlers(
        generateServicesUsagesMapFromServices(services),
        [
          {
            httpMethod: 'GET',
            url: '/api/users/{id}',
            filePath: '/path/to/handler.ts',
          },
        ],
        '/path/to/handlers'
      )
    ).toEqual([
      {
        type: 'missing_handler',
        usedIn: ['/path/to/used-in-component.ts'],
        suggestedPath: path.join(
          '/path/to/handlers/handlers/services/UserService/createUser.ts'
        ),
        service: services[1],
      },
    ] as MissingHandlerError[]);
  });

  it('should match handlers with wildcard prefix', () => {
    const services: ServiceInfo[] = [
      {
        path: '/path/to/UserService.ts',
        name: 'UserService',
        methodName: 'getUserById',
        toHandleUrl: '/api/users/{id}',
        toHandleHttpMethod: 'GET',
      },
    ];
    expect(
      getMissingHandlers(
        generateServicesUsagesMapFromServices(services),
        [
          {
            httpMethod: 'GET',
            url: '*/api/users/{id}',
            filePath: '/path/to/handler.ts',
          },
        ],
        '/path/to/handlers'
      )
    ).toEqual([]);
  });

  it('should handle multiple services with mixed matches', () => {
    const services: ServiceInfo[] = [
      {
        path: '/path/to/UserService.ts',
        name: 'UserService',
        methodName: 'getUserById',
        toHandleUrl: '/api/users/{id}',
        toHandleHttpMethod: 'GET',
      },
      {
        path: '/path/to/PetService.ts',
        name: 'PetService',
        methodName: 'getPetById',
        toHandleUrl: '/pet/{petId}',
        toHandleHttpMethod: 'GET',
      },
    ];
    const result = getMissingHandlers(
      generateServicesUsagesMapFromServices(services),
      [
        {
          httpMethod: 'GET',
          url: '/api/users/{id}',
          filePath: '/path/to/handler.ts',
        },
      ],
      '/path/to/handlers'
    );
    expect(result).toHaveLength(1);
    expect(result[0].service.name).toBe('PetService');
    expect(result[0].service.methodName).toBe('getPetById');
  });
});
