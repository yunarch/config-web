import type { HttpHandler } from 'msw';
import { describe, expectTypeOf, it } from 'vitest';
import {
  http,
  type OpenapiPathParams,
  type OpenapiPathRequestBody,
  type OpenapiPathResponseBody,
} from '../../../__mocks__/openapi-sync-input/openapi-msw-http';

describe('openapi-msw-http type tests', () => {
  it('should have empty type for paths without parameters', () => {
    type NoParams = OpenapiPathParams<'/pet', 'post'>;
    expectTypeOf<NoParams>().toEqualTypeOf<Record<never, never>>();
  });

  it('should extract path parameters from simple paths', () => {
    type PetIdParams = OpenapiPathParams<'/pet/{petId}', 'get'>;
    expectTypeOf<PetIdParams>().toHaveProperty('petId');
  });

  it('should extract request body types for endpoints', () => {
    // POST endpoint
    type PostBodyType = OpenapiPathRequestBody<'/pet', 'post'>;
    expectTypeOf<PostBodyType>().toHaveProperty('name');
    expectTypeOf<PostBodyType>().toHaveProperty('status');
    // PUT endpoint
    type PutBodyType = OpenapiPathRequestBody<'/pet', 'put'>;
    expectTypeOf<PutBodyType>().toHaveProperty('id');
    expectTypeOf<PutBodyType>().toHaveProperty('name');
  });

  it('should extract response body for endpoints', () => {
    // GET
    type GetResponseType = OpenapiPathResponseBody<'/pet/{petId}', 'get'>;
    expectTypeOf<GetResponseType>().toHaveProperty('id');
    expectTypeOf<GetResponseType>().toHaveProperty('name');
    // POST
    type PostResponseType = OpenapiPathResponseBody<'/pet/{petId}', 'post'>;
    expectTypeOf<PostResponseType>().toHaveProperty('id');
    expectTypeOf<PostResponseType>().toHaveProperty('name');
  });

  it('should return HttpHandler type', () => {
    expectTypeOf(http).returns.toEqualTypeOf<HttpHandler>();
  });
});
