import { writeFile } from 'node:fs/promises';
import { TEMPLATE } from './openapi-msw-http';

/**
 * Generate MSW utils from OpenAPI schema.
 *
 * @param outputDirectory - The output directory for generated models.
 */
export async function run(outputDirectory: string) {
  await writeFile(`${outputDirectory}/openapi-msw-http.ts`, TEMPLATE);
}
