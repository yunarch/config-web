#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/formatters/config.prettier';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(rootDir, 'src/formatters/config.oxfmt.jsonc');
const TMP_DIR = path.join(rootDir, 'tmp-oxfmt');

/**
 * Main function to generate oxfmt config from the prettier config.
 *
 * @returns A promise that resolves when the oxfmt config has been generated.
 */
async function generateOxfmtConfig() {
  const start = Date.now();
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.writeFile(
    path.join(TMP_DIR, '.prettierrc.json'),
    JSON.stringify(config)
  );
  execSync('bunx oxfmt --migrate=prettier', {
    cwd: TMP_DIR,
    stdio: 'inherit',
  });
  const generatedConfig = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, '.oxfmtrc.json'), 'utf8')
  ) as Record<string, unknown>;
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({
      $schema:
        'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxfmt/configuration_schema.json',
      ...generatedConfig,
      experimentalSortPackageJson: false,
    })
  );
  await fs.rm(TMP_DIR, { recursive: true, force: true });
  console.log(`Generated oxfmt config in ${Date.now() - start}ms`);
}

// Run the oxfmt config generator
await generateOxfmtConfig();
