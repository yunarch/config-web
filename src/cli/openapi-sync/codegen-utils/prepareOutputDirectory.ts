import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { runTask } from '../../utils';

/**
 * Reads the output directory path and creates it if it doesn't exist.
 *
 * @param output - The output directory path.
 * @returns the output directory path.
 *
 * @throws {Error} If the output path is not a directory.
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
