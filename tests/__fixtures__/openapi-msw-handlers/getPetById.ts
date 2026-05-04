// Fixture: openapi-msw-http direct import
import { HttpResponse } from 'msw';
import { http } from '../../__mocks__/openapi-gen-input/openapi-msw-http';

export const getPetById = http('/pet/{petId}', 'get', () => {
  return HttpResponse.json({ id: 1, name: 'Rex', photoUrls: [] });
});
