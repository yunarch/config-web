#!/usr/bin/env bun
import fs from 'node:fs/promises';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import * as categoriesRules from 'eslint-plugin-oxlint/rules-by-category';
import { config } from '../src/linters/eslint/config';
import { BASE_IGNORES } from '../src/linters/eslint/configs/base';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, './src/linters/config.oxlint.jsonc');

// eslint config to migrate
const eslintConfigs = await config({
  typescript: {
    tsconfigPath: './tsconfig.json', // It doesn't matter if the file doesn't exist is just for the compat generation.
  },
  import: true,
  jsdoc: true,
  unicorn: true,
  test: true,
  tanstack: true,
  react: true,
});

// Define the plugins scopes on oxlint with their possible scopes for eslint
const PLUGINS_SCOPES_OXLINT_ESLINT = {
  import: ['import', 'import-x'],
  jest: ['jest'],
  jsdoc: ['jsdoc'],
  'jsx-a11y': ['jsx-a11y'],
  nextjs: ['next'],
  node: ['node'],
  promise: ['promise'],
  react: [
    'react',
    '@eslint-react',
    '@eslint-react/dom',
    'react-hooks',
    '@eslint-react/hooks-extra',
  ],
  'react-perf': ['react-perf'],
  typescript: ['@typescript-eslint'],
  unicorn: ['unicorn'],
  vitest: ['vitest'],
} as const;

/**
 * @param ruleName - The eslint rule name to check.
 * @returns The oxlint rule name if found, `undefined` otherwise.
 */
function getOxlintRuleNameFromEslintRule(ruleName: string): string | undefined {
  let oxlintRuleName: string | undefined;
  for (const rule of Object.values(categoriesRules)) {
    if (Object.hasOwn(rule, ruleName)) {
      oxlintRuleName = ruleName;
      break;
    }
    for (const [oxlintScope, eslintScopes] of Object.entries(
      PLUGINS_SCOPES_OXLINT_ESLINT
    )) {
      const eslintScope = eslintScopes.find((scope) =>
        ruleName.startsWith(`${scope}/`)
      );
      if (eslintScope) {
        const r = ruleName.replace(`${eslintScope}/`, '');
        const aliasRuleName = `${oxlintScope}/${r}`;
        if (Object.hasOwn(rule, aliasRuleName)) {
          oxlintRuleName = aliasRuleName;
          break;
        }
      }
    }
  }
  return oxlintRuleName;
}

/**
 * @param ruleName - The eslint rule name to check.
 * @returns The oxlint plugin scope if found, `undefined` otherwise.
 */
function getOxlintPluginScopeFromEslintRule(ruleName: string) {
  return Object.entries(PLUGINS_SCOPES_OXLINT_ESLINT).find(
    ([, eslintScopes]) => {
      return eslintScopes.some((scope) => ruleName.startsWith(`${scope}/`));
    }
  )?.[0];
}

/**
 * Main function to generate oxlint config from the eslint config.
 */
async function generateOxlintConfig() {
  const start = Date.now();
  const oxlintPlugins = new Set<string>(['eslint']);
  const oxlintRules: Record<string, unknown> = {};
  const oxlintOverrideRules: Record<string, unknown>[] = [];
  for (const c of eslintConfigs) {
    if (!c.rules) continue;
    // Override rules
    if (c.files) {
      const override = {
        files: c.files,
        rules: {} as Record<string, unknown>,
      };
      for (const rule in c.rules) {
        const oxlintRuleName = getOxlintRuleNameFromEslintRule(rule);
        if (oxlintRuleName) {
          override.rules[oxlintRuleName] = c.rules[rule];
          const oxlintPlugin = getOxlintPluginScopeFromEslintRule(rule);
          if (oxlintPlugin) oxlintPlugins.add(oxlintPlugin);
        }
      }
      if (Object.keys(override.rules).length > 0) {
        oxlintOverrideRules.push(override);
      }
    }
    // Regular rules
    else {
      for (const rule in c.rules) {
        const oxlintRuleName = getOxlintRuleNameFromEslintRule(rule);
        if (oxlintRuleName) {
          oxlintRules[oxlintRuleName] = c.rules[rule];
          const oxlintPlugin = getOxlintPluginScopeFromEslintRule(rule);
          if (oxlintPlugin) oxlintPlugins.add(oxlintPlugin);
        }
      }
    }
  }
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({
      $schema:
        'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
      ignorePatterns: [...BASE_IGNORES],
      plugins: [...oxlintPlugins],
      rules: oxlintRules,
      overrides: oxlintOverrideRules,
    })
  );
  console.log(`Generated oxlint config in ${Date.now() - start}ms`);
  exit(0);
}

// Run the oxlint config generator
await generateOxlintConfig();
