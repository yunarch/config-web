import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { asyncExec, runTask } from '../utils';

/**
 * Reads the output directory path and creates it if it doesn't exist.
 *
 * @param output - The output directory path.
 * @returns the output directory path.
 *
 * @throws If the output path is not a directory.
 */
export async function prepareOutputDirectory(output: string) {
  if (path.extname(output) !== '') {
    throw new Error('Output must be a directory.');
  }
  const cwdPath = process.cwd();
  const absolutePath = path.resolve(output);
  const isInsideCwd = absolutePath.startsWith(cwdPath);
  const dir = isInsideCwd
    ? absolutePath
    : path.resolve(cwdPath, path.relative(path.parse(output).root, output));
  if (!existsSync(dir)) {
    await runTask({
      name: 'Generating output directory',
      command: async () => {
        await mkdir(dir, { recursive: true });
      },
    });
  }
  return dir;
}

/**
 * Reads the input OpenAPI schema and the output OpenAPI schema from the specified paths.
 *
 * @param inputSchemaPath - The input OpenAPI schema path or URL.
 * @param outputSchemaPath - The output OpenAPI schema path.
 * @returns A tuple containing the input OpenAPI schema and the output OpenAPI schema (or false if it doesn't exist).
 */
export async function readOpenapiSchemas(
  inputSchemaPath: string,
  outputSchemaPath: string
) {
  const [inputSchema, outputSchema] = await Promise.all([
    runTask({
      name: 'Reading input openapi schema',
      command: async () => {
        if (!inputSchemaPath.endsWith('.json')) {
          throw new Error(`Input file must be a JSON file: ${inputSchemaPath}`);
        }
        if (inputSchemaPath.startsWith('http')) {
          try {
            const { stdout } = await asyncExec(
              `curl -s ${inputSchemaPath} --fail`
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
      },
    }),
    runTask({
      name: 'Reading output openapi schema',
      command: async () => {
        if (!outputSchemaPath.endsWith('.json')) {
          throw new Error(
            `Output file must be a JSON file: ${outputSchemaPath}`
          );
        }
        if (!existsSync(outputSchemaPath)) return false;
        return await readFile(outputSchemaPath, 'utf8');
      },
    }),
  ]);
  return [
    JSON.stringify(JSON.parse(inputSchema)),
    outputSchema ? JSON.stringify(JSON.parse(outputSchema)) : false,
  ] as const;
}
