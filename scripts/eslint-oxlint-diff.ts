#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diff, printDiffResult } from '@yunarch/eslint-oxlint-diff';
import * as jsoncParser from 'jsonc-parser';
import { config } from '../src/linters/eslint/config';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OXLINT_CONFIG_PATH = path.join(
  rootDir,
  './src/linters/config.oxlint.jsonc'
);

/**
 * Main function – compares ESLint and OxLint rules and prints the diff.
 */
async function main() {
  const eslintConfigs = await config({
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    import: true,
    jsdoc: true,
    unicorn: true,
    test: true,
    tanstack: true,
    react: true,
    // NOTE: Do NOT pass oxlint here – we want the raw ESLint rules before oxlint disables
  });
  const content = await fs.readFile(OXLINT_CONFIG_PATH, 'utf8');
  const oxlintConfig = jsoncParser.parse(content) as {
    rules?: Record<string, unknown>;
    overrides?: { rules?: Record<string, unknown> }[];
  };
  const result = diff(eslintConfigs, oxlintConfig);
  printDiffResult(result);
}

// Run the main function
await main();
