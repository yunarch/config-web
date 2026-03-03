import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { runTask } from '../../utils';

/**
 * Reads the input OpenAPI schema from the specified path or URL.
 *
 * @param inputSchemaPath - The input OpenAPI schema path or URL.
 * @returns The input OpenAPI schema as a string.
 *
 * @throws {Error} If the input schema path is not a JSON file or if the file does not exist.
 */
async function readInputOpenapiSchema(inputSchemaPath: string) {
  if (!inputSchemaPath.endsWith('.json')) {
    throw new Error(`Input file must be a JSON file: ${inputSchemaPath}`);
  }
  if (inputSchemaPath.startsWith('http')) {
    try {
      const response = await fetch(inputSchemaPath);
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
      return await response.text();
    } catch (error) {
      throw new Error(
        `Failed to fetch remote OpenAPI file: ${inputSchemaPath}`,
        { cause: error }
      );
    }
  }
  if (!existsSync(inputSchemaPath)) {
    throw new Error(`Input file does not exist: ${inputSchemaPath}`);
  }
  return await readFile(inputSchemaPath, 'utf8');
}

/**
 * Reads the output OpenAPI schema from the specified path.
 *
 * @param outputSchemaPath - The output OpenAPI schema path.
 * @returns The output OpenAPI schema as a string.
 *
 * @throws {Error} If the output schema path is not a JSON file.
 */
async function readOutputOpenapiSchema(outputSchemaPath: string) {
  if (!outputSchemaPath.endsWith('.json')) {
    throw new Error(`Output file must be a JSON file: ${outputSchemaPath}`);
  }
  if (!existsSync(outputSchemaPath)) return false;
  return await readFile(outputSchemaPath, 'utf8');
}

/**
 * Reads both input and output OpenAPI schemas.
 *
 * @param inputSchemaPath - The input OpenAPI schema path or URL.
 * @param outputSchemaPath - The output OpenAPI schema path.
 * @returns A tuple containing the input and output OpenAPI schemas as strings.
 */
export async function readOpenapiSchemasTask(
  inputSchemaPath: string,
  outputSchemaPath: string
) {
  return await runTask({
    name: 'Reading OpenAPI schemas',
    command: async () => {
      const [inputContent, outputContent] = await Promise.all([
        readInputOpenapiSchema(inputSchemaPath),
        readOutputOpenapiSchema(outputSchemaPath),
      ]);
      return [
        JSON.stringify(JSON.parse(inputContent)),
        outputContent ? JSON.stringify(JSON.parse(outputContent)) : false,
      ] as const;
    },
  });
}
