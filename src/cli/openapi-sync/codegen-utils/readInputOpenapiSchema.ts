import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { asyncExecFile } from '../../utils';

/**
 * Reads the input OpenAPI schema from the specified path or URL.
 *
 * @param inputSchemaPath - The input OpenAPI schema path or URL.
 * @returns The input OpenAPI schema as a string.
 *
 * @throws {Error} If the input schema path is not a JSON file or if the file does not exist.
 */
export async function readInputOpenapiSchema(inputSchemaPath: string) {
  if (!inputSchemaPath.endsWith('.json')) {
    throw new Error(`Input file must be a JSON file: ${inputSchemaPath}`);
  }
  if (inputSchemaPath.startsWith('http')) {
    try {
      const { stdout } = await asyncExecFile(
        'curl',
        ['-s', inputSchemaPath, '--fail'],
        { encoding: 'utf8' }
      );
      return stdout;
    } catch {
      throw new Error(
        `Failed to fetch remote OpenAPI file: ${inputSchemaPath}`
      );
    }
  }
  if (!existsSync(inputSchemaPath)) {
    throw new Error(`Input file does not exist: ${inputSchemaPath}`);
  }
  return await readFile(inputSchemaPath, 'utf8');
}
