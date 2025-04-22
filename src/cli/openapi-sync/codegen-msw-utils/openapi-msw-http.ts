export const TEMPLATE = `
import {
  http as mswHttp,
  type DefaultBodyType,
  type HttpHandler,
  type HttpResponseResolver,
  type PathParams,
  type RequestHandlerOptions,
} from 'msw';
import type { paths } from './schema';

// Type definitions
type HttpMethod =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace';

/**
 * Type guard to get the http methods available for a given path.
 */
type Methods<Path extends keyof paths> = {
  [M in keyof paths[Path]]: M extends HttpMethod
    ? paths[Path][M] extends undefined
      ? never
      : M
    : never;
}[keyof paths[Path]];

/**
 * Type guard to get the content type 'application/json' or  'multipart/form-data' of a type.
 */
type ExtractContent<T> = T extends { content?: infer C }
  ? undefined extends C
    ? DefaultBodyType
    : 'application/json' extends keyof C
      ? C['application/json']
      : 'multipart/form-data' extends keyof C
        ? C['multipart/form-data']
        : DefaultBodyType
  : DefaultBodyType;

/**
 * Type guard to get the parameters of a path.
 */
type OpenapiPathParams<
  P extends keyof paths,
  M extends keyof paths[P],
> = 'parameters' extends keyof paths[P][M]
  ? 'path' extends keyof paths[P][M]['parameters']
    ? PathParams<keyof paths[P][M]['parameters']['path']>
    : PathParams
  : PathParams;

/**
 * Type guard to get the request body of a path.
 */
type OpenapiPathRequestBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends { requestBody?: infer RB }
  ? undefined extends RB
    ? DefaultBodyType
    : ExtractContent<RB>
  : DefaultBodyType;

/**
 * Type guard to get the response body of a path.
 */
type OpenapiPathResponseBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends { responses?: infer R }
  ? undefined extends R
    ? DefaultBodyType
    : 200 extends keyof R
      ? ExtractContent<R[200]>
      : 201 extends keyof R
        ? ExtractContent<R[201]>
        : DefaultBodyType
  : DefaultBodyType;

/**
 * Wrapper around MSW http function so we can have "typesafe" handlers against an openapi schema.
 *
 * @param path - The path to use from the openapi definition.
 * @param method - The method to use on the handler.
 * @param resolver - The MSW resolver function.
 * @param options - The MSW http request handler options.
 * @returns a typesafe wrapper for MSW http function.
 *
 * @throws Error if the method is not supported.
 */
export function http<P extends keyof paths, M extends Methods<P>>(
  path: P,
  method: M,
  resolver: HttpResponseResolver<
    OpenapiPathParams<P, M>,
    OpenapiPathRequestBody<P, M>,
    OpenapiPathResponseBody<P, M>
  >,
  options?: RequestHandlerOptions
): HttpHandler {
  const uri = \`*\${path.toString().replaceAll(/{(?<temp1>[^}]+)}/g, ':$1')}\`;
  const handlers = {
    head: mswHttp.head(uri, resolver, options),
    get: mswHttp.get(uri, resolver, options),
    post: mswHttp.post(uri, resolver, options),
    put: mswHttp.put(uri, resolver, options),
    delete: mswHttp.delete(uri, resolver, options),
    patch: mswHttp.patch(uri, resolver, options),
    options: mswHttp.options(uri, resolver, options),
  } as const;
  if (typeof method !== 'string' || !Object.hasOwn(handlers, method)) {
    throw new Error('Unsupported Http Method');
  }
  return handlers[method as keyof typeof handlers];
}
`;
