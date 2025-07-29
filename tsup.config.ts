import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { parse } from 'jsonc-parser';
import { defineConfig } from 'tsup';

/**
 * Parses a JSONC file into a JSON file.
 *
 * @param filePath - The path to the JSONC file.
 * @param outputPath - The path to the output JSON file.
 */
async function parseJSONC(filePath: string, outputPath: string) {
  const data = await readFile(filePath, 'utf8');
  const jsonObject = parse(data) as Record<string, unknown>;
  if ('$schema' in jsonObject) delete jsonObject.$schema;
  await writeFile(outputPath, JSON.stringify(jsonObject));
}

// Configuration for the tsup bundler.
export default defineConfig([
  // Main entry point
  {
    entry: ['./src/index.ts'],
    outDir: './dist',
    format: 'esm',
    minify: true,
    clean: true,
    shims: true,
    onSuccess: async () => {
      // Copy config files to the dist directory.
      await Promise.all([
        // Biome config
        parseJSONC('./src/biome.config.jsonc', './dist/biome.config.json'),
        // Oxlint config
        parseJSONC('./src/oxlint.config.jsonc', './dist/oxlint.config.json'),
        // Typescript
        mkdir('./dist/ts', { recursive: true }),
        copyFile('./src/ts/reset.d.ts', './dist/ts/reset.d.ts'),
        copyFile('./src/ts/utils.d.ts', './dist/ts/utils.d.ts'),
        parseJSONC(
          './src/ts/tsconfig-base.jsonc',
          './dist/ts/tsconfig-base.json'
        ),
      ]);
    },
  },
  // Cli
  {
    entry: [
      './src/cli/bun-run-all/index.ts',
      './src/cli/openapi-sync/openapi-sync.ts',
      './src/cli/openapi-sync/openapi-sync-lint-msw-handlers.ts',
      './src/cli/turbo-select/index.ts',
    ],
    outDir: './dist/cli',
    format: 'esm',
    minify: true,
    shims: true,
  },
  // Prettier
  {
    // TODO - Refactor to prettier.config.ts when https://github.com/nodejs/node/pull/57298 is released
    // TODO - Atm whe do not give ts support for prettier.config file
    entry: ['./src/prettier.config.js'],
    outDir: './dist',
    format: 'esm',
    // dts: true, // TODO - Enable when we use prettier.config.ts
    minify: true,
    shims: true,
  },
  // Eslint
  {
    entry: ['./src/eslint.config.ts'],
    outDir: './dist',
    format: 'esm',
    dts: true,
    minify: true,
    shims: true,
  },
]);
