import { ESLint } from 'eslint';
import { it } from 'vitest';
import { config as eslintConfig } from '../src/linters/config.eslint';
import { asyncExecFile, createRelativeResolver } from './test-utils';

const resolve = createRelativeResolver(import.meta.url);
const FIXTURES_PATH = resolve('./__fixtures__/');

/**
 * Async function to execute ESLint against a file.
 *
 * @param file - The file to lint.
 * @returns A promise that resolves to an object containing:
 * - ok: boolean indicating if the linter passed without errors.
 * - output: string containing the linter's output or error message.
 */
async function asyncExecEslint(file: string) {
  const eslintConfigs = await eslintConfig({
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    import: true,
    unicorn: true,
    jsdoc: true,
    react: true,
    tanstack: true,
    test: false,
  });
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: eslintConfigs,
  });
  const results = await eslint.lintFiles(file);
  const result = results[0];
  return {
    ok: result.errorCount === 0,
    output: result.messages.map((msg) => msg.ruleId),
  };
}

/**
 * Async function to execute a cli linter command against a file.
 *
 * @param linter - The linter command to execute (e.g., 'oxlint').
 * @param file - The file to lint.
 * @returns A promise that resolves to an object containing:
 * - ok: boolean indicating if the linter passed without errors.
 * - output: string containing the linter's output or error message.
 */
async function asyncExecLinter(linter: string, file: string) {
  try {
    await asyncExecFile(linter, [file]);
    return { ok: true, output: '' };
  } catch (error) {
    const e = error as { stdout?: string; message: string };
    return { ok: false, output: e.stdout ?? e.message };
  }
}

/**
 * Utility function to lint a file with specified linters and check for expected errors.
 *
 * @param file - The path to the file to lint. It always resolves to the __fixtures__ directory.
 * @param testCase - The test case to run, containing:
 * - title: The title of the test case.
 * - expectedIdRules: An object specifying expected rule IDs for each linter (eslint, oxlint).
 */
export function lintFile(
  file: string,
  testCase: {
    title: string;
    expectedRulesIds: { eslint: string[]; oxlint?: string[] };
  }
) {
  const testFile = `${FIXTURES_PATH}/${file}`;
  const { title, expectedRulesIds } = testCase;

  // ESLint test
  it.concurrent(`[eslint] ${title}`, async ({ expect }) => {
    const rulesIds = expectedRulesIds.eslint;
    const { ok, output } = await asyncExecEslint(testFile);
    expect(ok).toBe(rulesIds.length === 0);
    for (const ruleId of rulesIds) {
      expect(output).toContain(ruleId);
    }
  });

  // Oxlint tests
  it.skipIf(expectedRulesIds.oxlint === undefined).concurrent(
    `[oxlint] ${title}`,
    async ({ expect }) => {
      const rulesIds = expectedRulesIds.oxlint ?? [];
      const { ok, output } = await asyncExecLinter('oxlint', testFile);
      expect(ok).toBe(rulesIds.length === 0);
      for (const ruleId of rulesIds) {
        expect(output).toContain(ruleId);
      }
    }
  );
}
