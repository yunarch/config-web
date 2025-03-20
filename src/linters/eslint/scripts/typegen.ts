import { builtinRules } from 'eslint/use-at-your-own-risk';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import fs from 'node:fs/promises';
import { base } from '../configs/base';
import { combine } from '../utils';
import type { TypedFlatConfigItem } from '../types';

/**
 * Extracts rule lists from an array of linter configurations and generates a TypeScript interface.
 *
 * This function takes an array of linter configuration objects, extracts rule IDs from each,
 * and formats them into a TypeScript interface where each configuration name maps to a union type
 * of its respective rule names.
 *
 * @param configs - An array of linter configuration objects.
 * @returns A string representation of a TypeScript interface defining the rule lists.
 */
function flatConfigsToRuleListDTS(configs: TypedFlatConfigItem[]) {
  const rules = new Map<string, Set<string>>();
  for (const config of configs) {
    if (!config.name) continue;
    const ruleList = new Set<string>();
    for (const [ruleId, rule] of Object.entries(config.rules ?? {})) {
      ruleList.add(ruleId);
    }
    if (ruleList.size > 0) rules.set(config.name ?? '', ruleList);
  }
  const ruleList = Array.from(rules).map(([key, ruleSet]) => {
    const values = Array.from(ruleSet).map(
      (rule) => `"${rule}"?: RuleOptions["${rule}"]`
    );
    return `\t"${key}": {${values.join(',')}}`;
  });
  return `export interface RuleList {\n${ruleList.join(',\n')}\n}`;
}

// Define configs
const configs = await combine(
  {
    plugins: {
      '': {
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  base()
);

// Generate typegen.d.ts
const dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});
const dtsWithRileList = dts.concat('\n\n', flatConfigsToRuleListDTS(configs));

// Write typegen.d.ts
const __dirname = dirname(fileURLToPath(import.meta.url));
await fs.writeFile(`${__dirname}/../typegen.d.ts`, dtsWithRileList);
