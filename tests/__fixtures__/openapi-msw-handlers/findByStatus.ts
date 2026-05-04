// Fixture: openapi-msw-http aliased import (http as openapiHttp)
import { HttpResponse } from 'msw';
import { http as openapiHttp } from '../../__mocks__/openapi-gen-input/openapi-msw-http';

export const findByStatus = openapiHttp('/pet/findByStatus', 'get', () => {
  return HttpResponse.json([]);
});
