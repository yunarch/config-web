import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type {
  ServiceInfo,
  ServicesUsagesMap,
} from '../../../../src/cli/openapi-sync/lint-msw-handlers/findServicesUsages';
import {
  getMissingHandlers,
  type MissingHandlerError,
} from '../../../../src/cli/openapi-sync/lint-msw-handlers/getMissingHandlers';

describe('openapi-sync-lint-msw-handlers getMissingHandlers', () => {
  it('should return an empty array when services and handlers are empty', () => {
    expect(
      getMissingHandlers(new Map(), new Map(), '/path/to/handlers')
    ).toEqual([]);
  });

  it('should return an empty array when services are empty', () => {
    expect(
      getMissingHandlers(
        new Map(),
        new Map([
          [
            'GET:/api/users/{id}',
            {
              path: '/api/users/{id}',
              httpMethod: 'GET',
              url: '/api/users/{id}',
            },
          ],
        ]),
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
        new Map(),
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
        new Map([
          [
            'GET:/api/users/{id}',
            {
              path: '/api/users/{id}',
              httpMethod: 'GET',
              url: '/api/users/{id}',
            },
          ],
        ]),
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
});

/**
 * Generates a map of service usages from an array of services.
 *
 * @param services - The array of services to process.
 * @returns A map where the keys are service names and the values are maps of method names to their usage information.
 */
function generateServicesUsagesMapFromServices(
  services: ServiceInfo[]
): ServicesUsagesMap {
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
}
