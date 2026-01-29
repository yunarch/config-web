#!/usr/bin/env bun
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { base } from '../src/linters/eslint/configs/base';
import { disables } from '../src/linters/eslint/configs/disables';
import { imports } from '../src/linters/eslint/configs/imports';
import { jsdoc } from '../src/linters/eslint/configs/jsdoc';
import { perfectionist } from '../src/linters/eslint/configs/perfectionist';
import { react } from '../src/linters/eslint/configs/react';
import { tanstack } from '../src/linters/eslint/configs/tanstack';
import { test } from '../src/linters/eslint/configs/test';
import { typescript } from '../src/linters/eslint/configs/typescript';
import { unicorn } from '../src/linters/eslint/configs/unicorn';
import { combine } from '../src/linters/eslint/utils';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, 'src/linters/eslint/typegen.d.ts');

// Define eslint configs, combining all available configs so the types cover all rules.
const configs = await combine(
  {
    plugins: {
      '': {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Deprecated but still needed, no known alternative atm.
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  base(),
  typescript({ tsconfigPath: './tsconfig.json' }), // It doesn't matter if the file doesn't exist is just for the typegen generation.
  imports(),
  jsdoc(),
  unicorn(),
  test(true), // All enabled for typegen generation.
  tanstack(true), // All enabled for typegen generation.
  react(true, { isTypescriptEnabled: true, isTypeAware: true }), // All enabled for typegen generation.
  perfectionist(),
  disables({})
);

/**
 * Main function to generate ESLint types.
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
