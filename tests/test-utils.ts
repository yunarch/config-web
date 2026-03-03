import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asyncExecFile } from '../src/cli/utils';

// Re-export asyncExecFile so test files import it from test-utils instead of directly from src/cli/utils.
// Centralizes the dependency for tests so we don't have to worry about path issues when importing from src/cli/utils in test files.
export { asyncExecFile } from '../src/cli/utils';

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
    return asyncExecFile('bun', ['run', cli, ...params], { shell: true });
  };
}

// Resolve paths
const resolve = createRelativeResolver(import.meta.url);
export const MOCKS_PATH = resolve('./__mocks__/');
export const FIXTURES_PATH = resolve('./__fixtures__/');
export const OPENAPI_GEN_INPUT = `${MOCKS_PATH}/openapi-gen-input.json`;
export const OPENAPI_GEN_OUTPUT = `${MOCKS_PATH}/openapi-gen-input/`;
export const FIXTURE_OXLINT_CONFIG_FILE = `${FIXTURES_PATH}/.oxlintrc.json`;

// CLI Executors
const testDist = process.env.TEST_DIST === 'true';
export const openapiGenExecutor = createCliExecutor(
  resolve(
    testDist
      ? '../dist/cli/openapi-gen/openapi-gen.cli.js'
      : '../src/cli/openapi-gen/openapi-gen.cli.ts'
  )
);
export const openapiMswLintExecutor = createCliExecutor(
  resolve(
    testDist
      ? '../dist/cli/openapi-msw-lint/openapi-msw-lint.cli.js'
      : '../src/cli/openapi-msw-lint/openapi-msw-lint.cli.ts'
  )
);
