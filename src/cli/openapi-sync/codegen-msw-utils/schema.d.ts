/*
 * Type declaration file to allow development without the actual schema.
 * This file should not be copied to the destination - it's only for development convenience.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- Need to be `paths` as codegen-schema-typedef creates it like this
export type paths = Record<
  string,
  {
    parameters?: unknown;
    get?: unknown;
    put?: unknown;
    post?: unknown;
    delete?: unknown;
    options?: unknown;
    head?: unknown;
    patch?: unknown;
    trace?: unknown;
  }
>;
