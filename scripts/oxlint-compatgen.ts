#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import migrateConfig from '@oxlint/migrate';
import { config } from '../src/linters/eslint/config';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, './src/linters/config.oxlint.jsonc');

// Eslint config to migrate
const eslintConfigs = await config({
  typescript: {
    tsconfigPath: './tsconfig.json', // Placeholder path for type generation
  },
  import: true,
  jsdoc: true,
  unicorn: true,
  test: true,
  tanstack: true,
  react: true,
});

/**
 * Generates an oxlint config from the ESLint config.
 *
 * @returns A promise that resolves when the config has been generated.
 */
async function generateOxlintConfig() {
  const start = Date.now();
  const oxlintConfig = await migrateConfig(eslintConfigs, undefined, {
    typeAware: true,
  });
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({
      ...oxlintConfig,
      $schema:
        'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
    })
  );
  console.log(`Generated oxlint config in ${Date.now() - start}ms`);
}

// Run the oxlint config generator
await generateOxlintConfig();
exit(0);
