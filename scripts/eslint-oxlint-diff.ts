#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
 * Checks if a rule value means the rule is active (error or warn).
 *
 * @param value - The rule value to check.
 * @returns Whether the rule is active.
 */
function isRuleActive(value: unknown): boolean {
  if (typeof value === 'string') {
    return value === 'error' || value === 'warn';
  }
  if (Array.isArray(value) && value.length > 0) {
    return (
      value[0] === 'error' ||
      value[0] === 'warn' ||
      value[0] === 2 ||
      value[0] === 1
    );
  }
  if (typeof value === 'number') {
    return value === 1 || value === 2;
  }
  return false;
}

/**
 * Collects all active ESLint rules from the resolved flat config.
 *
 * @returns A map of normalized rule names to their severity.
 */
async function getActiveEslintRules(): Promise<Map<string, string>> {
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
  const rules = new Map<string, string>();
  for (const cfg of eslintConfigs) {
    if (!cfg.rules) continue;
    for (const [name, value] of Object.entries(cfg.rules)) {
      if (isRuleActive(value)) {
        const severity = Array.isArray(value)
          ? String(value[0])
          : String(value);
        rules.set(name, severity);
      } else {
        // Rule explicitly turned off – remove from active set
        rules.delete(name);
      }
    }
  }
  return rules;
}

/**
 * Collects all active OxLint rules from the JSONC config file.
 *
 * @returns A set of normalized rule names.
 */
async function getActiveOxlintRules(): Promise<Set<string>> {
  const content = await fs.readFile(OXLINT_CONFIG_PATH, 'utf8');
  const oxlintConfig = jsoncParser.parse(content) as {
    rules?: Record<string, unknown>;
    overrides?: { rules?: Record<string, unknown> }[];
  };
  const rules = new Set<string>();
  // Top-level rules
  if (oxlintConfig.rules) {
    for (const [name, value] of Object.entries(oxlintConfig.rules)) {
      if (isRuleActive(value)) {
        rules.add(name);
      }
    }
  }
  // Override rules
  if (oxlintConfig.overrides) {
    for (const override of oxlintConfig.overrides) {
      if (!override.rules) continue;
      for (const [name, value] of Object.entries(override.rules)) {
        if (isRuleActive(value)) {
          rules.add(name);
        }
      }
    }
  }
  return rules;
}

/**
 * Main function – compares ESLint and OxLint rules and prints the diff.
 */
async function main() {
  const [eslintRules, oxlintRules] = await Promise.all([
    getActiveEslintRules(),
    getActiveOxlintRules(),
  ]);
  // ── Compute sets ────────────────────────────────────────────────────────
  const eslintOnly: string[] = []; // Active in ESLint, NOT in OxLint
  const coveredByOxlint: string[] = []; // Active in both
  const oxlintOnly: string[] = []; // Active in OxLint, NOT in ESLint
  for (const rule of eslintRules.keys()) {
    if (oxlintRules.has(rule)) {
      coveredByOxlint.push(rule);
    } else {
      eslintOnly.push(rule);
    }
  }
  for (const rule of oxlintRules) {
    if (!eslintRules.has(rule)) {
      oxlintOnly.push(rule);
    }
  }
  eslintOnly.sort();
  coveredByOxlint.sort();
  oxlintOnly.sort();
  // ── Print results ───────────────────────────────────────────────────────
  const DIVIDER = '─'.repeat(70);
  // ESLint-only rules not covered by OxLint
  console.log();
  console.log(DIVIDER);
  console.log('  ESLint rules NOT yet covered by OxLint');
  console.log(DIVIDER);
  console.log();
  const eslintOnlyByCategory = new Map<string, string[]>();
  for (const rule of eslintOnly) {
    const category =
      rule.lastIndexOf('/') > 0
        ? rule.slice(0, rule.lastIndexOf('/'))
        : 'eslint-core';
    if (!eslintOnlyByCategory.has(category)) {
      eslintOnlyByCategory.set(category, []);
    }
    eslintOnlyByCategory.get(category)?.push(rule);
  }
  const sortedCategories = [...eslintOnlyByCategory.entries()].toSorted(
    ([a], [b]) => a.localeCompare(b)
  );
  for (const [category, rules] of sortedCategories) {
    console.log(`  📦 ${category} (${rules.length})`);
    for (const rule of rules) {
      console.log(`     ├─ ${rule}`);
    }
    console.log();
  }
  // OxLint-only (extra rules in OxLint not in ESLint)
  if (oxlintOnly.length > 0) {
    console.log(DIVIDER);
    console.log('  OxLint rules NOT in ESLint config');
    console.log(DIVIDER);
    console.log();
    for (const rule of oxlintOnly) {
      console.log(`     ├─ ${rule}`);
    }
    console.log();
  }
  // Summary
  console.log(DIVIDER);
  console.log('  ESLint ↔ OxLint Rule Comparison');
  console.log(DIVIDER);
  console.log();
  console.log(`  Total active ESLint rules:    ${eslintRules.size}`);
  console.log(`  Total active OxLint rules:    ${oxlintRules.size}`);
  console.log(`  Covered by OxLint:            ${coveredByOxlint.length}`);
  console.log(`  ESLint-only (not in OxLint):  ${eslintOnly.length}`);
  console.log(`  OxLint-only (not in ESLint):  ${oxlintOnly.length}`);
  console.log();
  console.log(
    `  OxLint coverage of ESLint rules: ${
      eslintRules.size > 0
        ? ((coveredByOxlint.length / eslintRules.size) * 100).toFixed(2)
        : '0'
    }%`
  );
}

await main();
