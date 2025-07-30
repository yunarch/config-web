import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTask } from '../../utils';

/**
 * Generate MSW utils from OpenAPI schema.
 *
 * @param outputDirectory - The output directory for generated models.
 */
export async function run(outputDirectory: string) {
  await runTask({
    name: 'Generating openapi MSW utils',
    command: async () => {
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = path.dirname(currentFilePath);
      const openapiMswHttp = path.join(currentDir, 'openapi-msw-http.ts');
      await copyFile(
        openapiMswHttp,
        path.join(outputDirectory, 'openapi-msw-http.ts')
      );
    },
  });
}
