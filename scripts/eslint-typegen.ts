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

// Define configs
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
  test({}),
  tanstack(true), // All enabled for typegen generation.
  react({ isTypescriptEnabled: true, isTypeAware: true }), // All enabled for typegen generation.
  perfectionist(),
  disables({})
);

const configNames = configs.map((i) => i.name).filter(Boolean);

// Generate typegen.d.ts
const dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});
const dtsWithRileList = `${dts}\n\n// Names of all the configs\nexport type ConfigNames = ${configNames.map((i) => `'${i}'`).join(' | ')};`;

// Write typegen.d.ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
await fs.writeFile(
  `${__dirname}/../src/linters/eslint/typegen.d.ts`,
  dtsWithRileList
);
