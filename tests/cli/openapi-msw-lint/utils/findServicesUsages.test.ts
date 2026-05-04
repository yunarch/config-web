import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findServicesUsages } from '../../../../src/cli/openapi-msw-lint/utils/findServicesUsages';
import {
  FIXTURES_MSW_HANDLERS,
  FIXTURES_OPENAPI_SERVICES,
  FIXTURES_PATH,
  OPENAPI_GEN_OUTPUT,
} from '../../../test-utils';

describe('openapi-msw-lint findServicesUsages', () => {
  it('should throw when services directory does not exist', async () => {
    await expect(
      findServicesUsages({
        genPath: path.join(FIXTURES_PATH, 'nonexistent'),
        srcPath: FIXTURES_OPENAPI_SERVICES,
      })
    ).rejects.toThrow('Services directory not found');
  });

  it('should return empty map when no service methods are used in source', async () => {
    const result = await findServicesUsages({
      genPath: OPENAPI_GEN_OUTPUT,
      srcPath: FIXTURES_MSW_HANDLERS,
    });
    expect(result.size).toBe(0);
  });

  it('should extract service methods and detect usages in source files', async () => {
    const result = await findServicesUsages({
      genPath: OPENAPI_GEN_OUTPUT,
      srcPath: FIXTURES_OPENAPI_SERVICES,
    });
    const petMethods = result.get('PetService');
    const getPetById = petMethods?.get('getPetById');
    const storeMethods = result.get('StoreService');
    const getInventory = storeMethods?.get('getInventory');

    // Detects PetService.getPetById usage with correct metadata
    expect(result.has('PetService')).toBe(true);
    expect(petMethods?.has('getPetById')).toBe(true);
    expect(getPetById?.serviceInfo).toEqual(
      expect.objectContaining({
        name: 'PetService',
        methodName: 'getPetById',
        toHandleUrl: '/pet/{petId}',
        toHandleHttpMethod: 'GET',
      })
    );
    expect(getPetById?.files.size).toBeGreaterThanOrEqual(1);
    expect(
      [...(getPetById?.files ?? [])].some((f) => f.includes('getPetById'))
    ).toBe(true);

    // Detects StoreService.getInventory usage across services
    expect(result.has('StoreService')).toBe(true);
    expect(storeMethods?.has('getInventory')).toBe(true);
    expect(getInventory?.serviceInfo.toHandleUrl).toBe('/store/inventory');
    expect(getInventory?.serviceInfo.toHandleHttpMethod).toBe('GET');

    // Prunes unused methods from the map
    expect(petMethods?.has('updatePet')).toBeFalsy();
    expect(petMethods?.has('addPet')).toBeFalsy();
    expect(petMethods?.has('deletePet')).toBeFalsy();
    expect(storeMethods?.has('placeOrder')).toBeFalsy();
    expect(storeMethods?.has('deleteOrder')).toBeFalsy();

    // Returns absolute paths
    for (const [, methods] of result) {
      for (const [, { serviceInfo, files }] of methods) {
        expect(path.isAbsolute(serviceInfo.path)).toBe(true);
        for (const file of files) {
          expect(path.isAbsolute(file)).toBe(true);
        }
      }
    }
  });
});
