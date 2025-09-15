import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_IGNORES } from '../src/eslint/configs/base';

// Generate ignore patterns for Biome configuration
const BASE_IGNORE_PATTERN = BASE_IGNORES.map((ignore) => `!${ignore}`);

// TODO automate the biome config generation based on prettier and eslint configs

// Write `biome.config.jsonc` file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
await fs.writeFile(
  `${__dirname}/../src/config.biome.jsonc`,
  JSON.stringify({
    $schema: '../node_modules/@biomejs/biome/configuration_schema.json',
    // ======================================================================================
    // Formatter
    // ======================================================================================
    formatter: {
      enabled: true,
      includes: ['**', ...BASE_IGNORE_PATTERN],
      useEditorconfig: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: 2,
      lineEnding: 'lf',
      lineWidth: 80,
      attributePosition: 'auto',
      bracketSpacing: true,
    },
    javascript: {
      formatter: {
        jsxQuoteStyle: 'double',
        quoteProperties: 'asNeeded',
        trailingCommas: 'es5',
        semicolons: 'always',
        arrowParentheses: 'always',
        bracketSameLine: false,
        quoteStyle: 'single',
        attributePosition: 'auto',
        bracketSpacing: true,
      },
    },
    // ======================================================================================
    // Linter
    // ======================================================================================
    // Disable linter as we prefer to use ESlint or a combination of ESLint and Oxlint
    linter: {
      enabled: false,
      includes: [...BASE_IGNORE_PATTERN],
      // TODO rules
    },
    // ======================================================================================
    // Overrides
    // ======================================================================================
    overrides: [
      // Format overrides
      {
        includes: ['**/package.json'],
        formatter: {
          indentStyle: 'space',
        },
      },
      // Linter overrides
      // TODO
    ],
    // ======================================================================================
    // Assistants configuration
    // ======================================================================================
    assist: {
      actions: {
        source: {
          // Disable organizeImports as we prefer sort it by ESlint or Oxlint
          organizeImports: 'off',
        },
      },
    },
  })
);
