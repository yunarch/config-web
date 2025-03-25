import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { base } from '../configs/base';
import { imports } from '../configs/imports';
import { jsdoc } from '../configs/jsdoc';
import { typescript } from '../configs/typescript';
import { unicorn } from '../configs/unicorn';
import { combine } from '../utils';

// Define configs
const configs = await combine(
  {
    plugins: {
      '': {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Deprecated but still needed, no known alternative.
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  base(),
  typescript({ tsconfigPath: './tsconfig.json' }), // It doesn't matter if the file doesn't exist is just for the typegen generation.
  imports(),
  jsdoc(),
  unicorn()
);

const configNames = configs.map((i) => i.name).filter(Boolean);

// Generate typegen.d.ts
const dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});
const dtsWithRileList = `${dts}\n\n// Names of all the configs\nexport type ConfigNames = ${configNames.map((i) => `'${i}'`).join(' | ')};`;

// Write typegen.d.ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
await fs.writeFile(`${__dirname}/../typegen.d.ts`, dtsWithRileList);
