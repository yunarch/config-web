#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { config } from '../src/linters/config.eslint';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, 'src/linters/eslint/typegen.d.ts');

// Define eslint configs, combining all available configs so the types cover all rules.
const configs = await config({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  import: true,
  jsdoc: true,
  unicorn: true,
  react: true,
  test: true,
  tanstack: true,
}).prepend({
  plugins: {
    '': {
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Deprecated but still needed, no known alternative atm.
      rules: Object.fromEntries(builtinRules.entries()),
    },
  },
});

/**
 * Main function to generate ESLint types.
 *
 * @returns A promise that resolves when the ESLint types have been generated.
 */
async function generateEslintTypes() {
  const start = Date.now();
  const configNames = configs.map((i) => i.name).filter(Boolean);
  const dts = await flatConfigsToRulesDTS(configs, {
    includeAugmentation: false,
  });
  const dtsWithRileList = `${dts}\n\n// Names of all the configs\nexport type ConfigNames = ${configNames.map((i) => `'${i}'`).join(' | ')};`;
  await fs.writeFile(OUTPUT_PATH, dtsWithRileList);
  console.log(`Generated ESLint types in ${Date.now() - start}ms`);
}

// Run the ESLint types generator
await generateEslintTypes();
