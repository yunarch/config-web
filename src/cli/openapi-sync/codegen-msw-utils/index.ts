import { writeFile } from 'node:fs/promises';
import { runTask } from '../../utils';
import { TEMPLATE } from './openapi-msw-http';

/**
 * Generate MSW utils from OpenAPI schema.
 *
 * @param outputDirectory - The output directory for generated models.
 */
export async function run(outputDirectory: string) {
  await runTask({
    name: 'Generating openapi MSW utils',
    command: async () => {
      await writeFile(`${outputDirectory}/openapi-msw-http.ts`, TEMPLATE);
    },
  });
}
