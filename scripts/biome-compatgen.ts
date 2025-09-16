import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as prettierConfig } from '../src/config.prettier';
import { BASE_IGNORES } from '../src/eslint/configs/base';

// Generate ignore patterns for Biome configuration
const BASE_IGNORE_PATTERN = BASE_IGNORES.map((ignore) => `!${ignore}`);

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
      useEditorconfig: false,
      formatWithErrors: false,
      lineWidth: prettierConfig.printWidth,
      indentWidth: prettierConfig.tabWidth,
      indentStyle: prettierConfig.useTabs ? 'tab' : 'space',
      bracketSpacing: prettierConfig.bracketSpacing,
      bracketSameLine: prettierConfig.bracketSameLine,
      lineEnding: prettierConfig.endOfLine,
      attributePosition: 'auto',
    },
    javascript: {
      formatter: {
        semicolons: prettierConfig.semi ? 'always' : undefined,
        quoteStyle: prettierConfig.singleQuote ? 'single' : 'double',
        arrowParentheses:
          prettierConfig.arrowParens === 'always' ? 'always' : undefined,
        trailingCommas: prettierConfig.trailingComma,
        quoteProperties:
          prettierConfig.quoteProps === 'as-needed'
            ? 'asNeeded'
            : prettierConfig.quoteProps === 'preserve'
              ? 'preserve'
              : undefined,
        jsxQuoteStyle: prettierConfig.jsxSingleQuote ? 'single' : 'double',
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
