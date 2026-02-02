#!/usr/bin/env bun
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { config } from '../src/linters/eslint/config';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, './src/linters/config.oxlint.jsonc');
const TMP_DIR = path.join(rootDir, 'tmp-oxlint');

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

/**
 * Creates a JSON.stringify replacer that handles circular references.
 *
 * @returns A replacer function for JSON.stringify.
 */
function getCircularReplacer() {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return; // Remove circular reference
      }
      seen.add(value);
    }
    return value;
  };
}

/**
 * Main function to generate oxlint config from the eslint config.
 */
async function generateOxlintConfig() {
  const start = Date.now();
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.writeFile(
    path.join(TMP_DIR, 'eslint.config.js'),
    `export default ${JSON.stringify(eslintConfigs, getCircularReplacer(), 2)};`
  );
  execSync('bunx @oxlint/migrate --type-aware ./eslint.config.js', {
    cwd: TMP_DIR,
    stdio: 'inherit',
  });
  const generatedConfig = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, '.oxlintrc.json'), 'utf8')
  ) as Record<string, unknown>;
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({
      ...generatedConfig,
      $schema:
        'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
    })
  );
  await fs.rm(TMP_DIR, { recursive: true, force: true });
  console.log(`Generated oxlint config in ${Date.now() - start}ms`);
  exit(0);
}

// Run the oxlint config generator
await generateOxlintConfig();
