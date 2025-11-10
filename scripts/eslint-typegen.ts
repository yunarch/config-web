import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { base } from '../src/eslint/configs/base';
import { disables } from '../src/eslint/configs/disables';
import { imports } from '../src/eslint/configs/imports';
import { jsdoc } from '../src/eslint/configs/jsdoc';
import { perfectionist } from '../src/eslint/configs/perfectionist';
import { react } from '../src/eslint/configs/react';
import { tanstack } from '../src/eslint/configs/tanstack';
import { test } from '../src/eslint/configs/test';
import { typescript } from '../src/eslint/configs/typescript';
import { unicorn } from '../src/eslint/configs/unicorn';
import { combine } from '../src/eslint/utils';

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
  test(true), // All enabled for typegen generation.
  tanstack(true), // All enabled for typegen generation.
  react(true, { isTypescriptEnabled: true, isTypeAware: true }), // All enabled for typegen generation.
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
await fs.writeFile(`${__dirname}/../src/eslint/typegen.d.ts`, dtsWithRileList);
