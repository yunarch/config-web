import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

/**
 * Reads the output OpenAPI schema from the specified path.
 *
 * @param outputSchemaPath - The output OpenAPI schema path.
 * @returns The output OpenAPI schema as a string.
 *
 * @throws {Error} If the output schema path is not a JSON file.
 */
export async function readOutputOpenapiSchema(outputSchemaPath: string) {
  if (!outputSchemaPath.endsWith('.json')) {
    throw new Error(`Output file must be a JSON file: ${outputSchemaPath}`);
  }
  if (!existsSync(outputSchemaPath)) return false;
  return await readFile(outputSchemaPath, 'utf8');
}
