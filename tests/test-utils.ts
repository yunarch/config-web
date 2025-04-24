import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

/**
 * Creates a CLI executor function for a given command or script path.
 *
 * @param cli - The CLI script or executable.
 * @returns A function that runs the CLI with specified arguments and returns a Promise with the result.
 *
 * @example
 * ```ts
 * const run = createCliExecutor('./bin/tool.ts');
 * await run(['--version']);
 * ```
 */
export function createCliExecutor(cli: string) {
  return async (params: string[] = []) => {
    return promisify(exec)(`bun ${cli} ${params.join(' ')}`);
  };
}

/**
 * Creates a function that resolves relative paths based on a given module URL.
 *
 * This is useful when you want to resolve file paths relative to the file where
 * the function is called, by passing in `import.meta.url` from the caller module.
 *
 * @param metaUrl - `import.meta.url`
 * @returns A function that resolves a relative path to an absolute one.
 *
 * @example
 * ```ts
 * const resolve = createRelativeResolver(import.meta.url);
 * const configPath = resolve('./config.json'); // Absolute path
 * ```
 */
export function createRelativeResolver(metaUrl: string) {
  return (relativePath: string) => {
    return path.resolve(path.dirname(fileURLToPath(metaUrl)), relativePath);
  };
}
