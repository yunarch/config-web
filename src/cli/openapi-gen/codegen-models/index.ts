import { asyncExecFile } from '../../utils';

/**
 * Generate models and services from OpenAPI schema.
 *
 * TODO: at some point we should migrate from openapi-typescript-codegen and maybe build our own generator.
 * TODO: maybe take advantage of turborepo generators (It uses plopjs).
 *
 * @param input - The input OpenAPI schema path.
 * @param outputDirectory - The output directory for generated models.
 */
export async function run(input: string, outputDirectory: string) {
  await asyncExecFile(
    'npx',
    [
      'openapi-typescript-codegen',
      '--input',
      input,
      '--output',
      outputDirectory,
      '--client',
      'fetch',
    ],
    { shell: true }
  );
}
