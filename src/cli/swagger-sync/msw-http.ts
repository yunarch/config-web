import {
  http as mswHttp,
  type DefaultBodyType,
  type HttpHandler,
  type HttpResponseResolver,
  type PathParams,
  type RequestHandlerOptions,
} from 'msw';
import type { OpenAPIV3_1 as OpenApi } from 'openapi-types';

// Set the swagger primitive types
type PrimitivesType = {
  boolean: boolean;
  number: number;
  string: string;
  integer: number;
};

// Utility to mark certain keys on an object as required
type WithRequiredFields<
  T extends object,
  RequiredKeys extends string[] | undefined = [],
> = Required<
  Pick<
    T,
    // @ts-expect-error -- ignoring the error as we cannot satisfy the constrain but it will work anyway
    RequiredKeys[number]
  >
> &
  T;

// Utilities to maybe do something
type MaybeNullableFieldType<Field, FieldType> = 'nullable' extends keyof Field
  ? Field['nullable'] extends true
    ? FieldType | null
    : FieldType
  : FieldType;
type MaybeExtractBodyTypeFromRef<
  Swagger extends OpenApi.Document,
  O,
> = '$ref' extends keyof O
  ? O['$ref'] extends string
    ? MaybeNullableFieldType<O, ExtractBodyTypeFromRef<Swagger, O['$ref']>>
    : never
  : never;

/**
 * Utility to extract the field type by a primitive type name.
 */
type ExtractFieldType<Primitive extends keyof PrimitivesType> =
  PrimitivesType[Primitive];

/**
 * Utility to extract the body type.
 */
type ExtractBodyType<
  Swagger extends OpenApi.Document,
  T extends OpenApi.MediaTypeObject,
> = T['schema'] extends OpenApi.SchemaObject
  ? ExtractBodyTypeFromSchemaObject<Swagger, T['schema']>
  : T['schema'] extends OpenApi.ReferenceObject
    ? ExtractBodyTypeFromRef<Swagger, T['schema']['$ref']>
    : never;

/**
 * Utility to extract the body type from a reference.
 */
type ExtractBodyTypeFromRef<
  Swagger extends OpenApi.Document,
  T extends string,
> = T extends `#/components/schemas/${infer C}`
  ? C extends keyof NonNullable<Swagger['components']>['schemas']
    ? ExtractBodyTypeFromSchemaObject<
        Swagger,
        NonNullable<NonNullable<Swagger['components']>['schemas']>[C]
      >
    : never
  : never;

/**
 * Utility to extract the body type from a content object.
 */
type ExtractBodyTypeFromContent<
  Swagger extends OpenApi.Document,
  T extends { content?: OpenApi.MediaTypeObject },
> = 'application/json' extends keyof T['content']
  ? T['content']['application/json'] extends OpenApi.MediaTypeObject
    ? ExtractBodyType<Swagger, T['content']['application/json']>
    : never
  : never;

/**
 * Utility to extract the body type from a schema object.
 */
type ExtractBodyTypeFromSchemaObject<
  Swagger extends OpenApi.Document,
  Schema extends OpenApi.SchemaObject,
> = 'oneOf' extends keyof Schema
  ? Schema['oneOf'] extends (infer Item)[]
    ? Item extends OpenApi.ReferenceObject
      ? ExtractBodyTypeFromRef<Swagger, Item['$ref']>
      : Item extends OpenApi.SchemaObject
        ? 'null' extends Item['type']
          ? null
          : ExtractBodyTypeFromSchemaObject<Swagger, Item>
        : never
    : never
  : Schema extends OpenApi.ArraySchemaObject
    ? Schema['items'] extends OpenApi.ReferenceObject
      ? ExtractBodyTypeFromRef<Swagger, Schema['items']['$ref']>[]
      : Schema['items'] extends OpenApi.SchemaObject
        ? undefined extends Schema['items']['properties']
          ? MaybeNullableFieldType<
              Schema,
              ExtractFieldType<Schema['items']['type'] & keyof PrimitivesType>[]
            >
          : ExtractBodyTypeFromSchemaObject<Swagger, Schema['items']>
        : never
    : Schema['properties'] extends infer P
      ? WithRequiredFields<
          {
            [K in keyof P]?: P[K] extends OpenApi.ArraySchemaObject
              ? ExtractBodyTypeFromSchemaObject<Swagger, P[K]>
              : P[K] extends OpenApi.NonArraySchemaObject
                ? 'object' extends P[K]['type']
                  ? ExtractBodyTypeFromSchemaObject<Swagger, P[K]>
                  : MaybeNullableFieldType<
                      P[K],
                      ExtractFieldType<P[K]['type'] & keyof PrimitivesType>
                    >
                : MaybeExtractBodyTypeFromRef<Swagger, P[K]>;
          },
          Schema['required']
        >
      : never;

/**
 * This type is used to extract the request parameters from a swagger path.
 * It will extract the parameters from the path query string.
 */
export type SwaggerPathRequestParams<
  Swagger extends OpenApi.Document,
  P extends keyof Swagger['paths'],
  M extends keyof Swagger['paths'][P],
> = Swagger['paths'][P][M] extends OpenApi.OperationObject
  ? PathParams<
      Swagger['paths'][P][M]['parameters'] extends (infer U)[]
        ? U extends OpenApi.ParameterObject
          ? U['name']
          : never
        : never
    >
  : PathParams;

/**
 * This type is used to extract the request body from a swagger path.
 * It will return the body type of the request if it exists, otherwise it will return the default body type.
 */
export type SwaggerPathRequestBody<
  Swagger extends OpenApi.Document,
  P extends keyof Swagger['paths'],
  M extends keyof Swagger['paths'][P],
> = Swagger['paths'][P][M] extends OpenApi.OperationObject
  ? Swagger['paths'][P][M]['requestBody'] extends OpenApi.ReferenceObject
    ? ExtractBodyTypeFromRef<
        Swagger,
        Swagger['paths'][P][M]['requestBody']['$ref']
      >
    : Swagger['paths'][P][M]['requestBody'] extends OpenApi.RequestBodyObject
      ? ExtractBodyTypeFromContent<
          Swagger,
          Swagger['paths'][P][M]['requestBody']
        >
      : DefaultBodyType
  : DefaultBodyType;

/**
 * This type is used to extract the response type from a swagger path.
 * It will return the response type of the request if it exists, otherwise it will return the default body type.
 */
export type SwaggerPathResponseBody<
  Swagger extends OpenApi.Document,
  P extends keyof Swagger['paths'],
  M extends keyof Swagger['paths'][P],
> = Swagger['paths'][P][M] extends OpenApi.OperationObject
  ? '200' extends keyof Swagger['paths'][P][M]['responses']
    ? Swagger['paths'][P][M]['responses']['200'] extends OpenApi.ResponseObject
      ? ExtractBodyTypeFromContent<
          Swagger,
          Swagger['paths'][P][M]['responses']['200']
        >
      : DefaultBodyType
    : '201' extends keyof Swagger['paths'][P][M]['responses']
      ? Swagger['paths'][P][M]['responses']['201'] extends OpenApi.ResponseObject
        ? ExtractBodyTypeFromContent<
            Swagger,
            Swagger['paths'][P][M]['responses']['201']
          >
        : DefaultBodyType
      : DefaultBodyType
  : DefaultBodyType;

/**
 * Wrapper around MSW http function so we can have "typesafe" handlers against a swagger json file.
 * This is a bare minimum implementation and does not cover all the edge cases and
 *
 * ! It expects the swagger json to be in openapi 3.1 format and
 * ! only supports responses with 200 and 201 status codes and in json format.
 *
 * @param path - The path to use from the swagger definition.
 * @param method - The method to use on the handler.
 * @param resolver - The MSW resolver function.
 * @param options - The MSW http request handler options.
 * @returns a typesafe wrapper for MSW http function.
 *
 * @throws Error if the method is not supported.
 */
export function http<
  SwaggerDocumentType extends OpenApi.Document,
  P extends keyof SwaggerDocumentType['paths'],
  M extends keyof SwaggerDocumentType['paths'][P],
>(
  path: P,
  method: M,
  resolver: HttpResponseResolver<
    SwaggerPathRequestParams<SwaggerDocumentType, P, M>,
    SwaggerPathRequestBody<SwaggerDocumentType, P, M>,
    SwaggerPathResponseBody<SwaggerDocumentType, P, M>
  >,
  options?: RequestHandlerOptions
): HttpHandler {
  const uri = `*${path.toString().replaceAll(/{(?<temp1>[^}]+)}/g, ':$1')}`;
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
