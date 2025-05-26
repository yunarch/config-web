import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as categoriesRules from 'eslint-plugin-oxlint/rules-by-category';
import { config } from '../src/linters/eslint.config';

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

// Define oxlint plugins, rules and overrides
const oxlintPlugins = new Set<string>(['eslint']);
const oxlintRules: Record<string, unknown> = {};
const oxlintOverrideRules: Record<string, unknown>[] = [];

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

// Get eslint configs
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

// Write `oxlint.config.jsonc` file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
await fs.writeFile(
  `${__dirname}/../src/linters/oxlint.config.jsonc`,
  JSON.stringify({
    $schema:
      'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
    ignorePatterns: [
      // Node modules
      '**/node_modules/',
      // Build artifacts
      '**/dist/',
      '**/out/',
      '**/output',
      '**/.output',
      '**/build/',
      '**/*.min.*',
      // Dependencies
      '**/.yarn/',
      '**/.yarnrc.yml',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/bun.lock',
      '**/bun.lockb',
      '**/pnpm-lock.yaml',
      '**/.vite-inspect',
      '**/.vitepress/cache',
      '**/vite.config.*.timestamp-*',
      // Logs
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '.pnp.*',
      '**/.pnp',
      '**/.pnp.js',
      '**/.pnp.cjs',
      // Tests
      '**/coverage/',
      '**/.nyc_output/',
      '**/__snapshots__',
      // Editor/IDE/frameworks/tools configurations
      '**/.vscode/',
      '**/.idea/',
      '**/.cache',
      '**/.nuxt',
      '**/.next',
      '**/.svelte-kit',
      '**/.vercel',
      '**/.changeset',
      '**/.turbo/',
      // Misc
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/temp',
      '**/.temp',
      '**/tmp',
      '**/.tmp',
      '**/.history',
      '**/mockServiceWorker.js',
      '**/CHANGELOG*.md',
      '**/LICENSE*',
    ],
    plugins: [...oxlintPlugins],
    rules: oxlintRules,
    overrides: oxlintOverrideRules,
  })
);
