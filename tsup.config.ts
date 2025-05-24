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
    onSuccess: async () => {
      // Copy config files to the dist directory.
      await Promise.all([
        // Typescript
        mkdir('./dist/ts', { recursive: true }),
        copyFile('./src/ts/reset.d.ts', './dist/ts/reset.d.ts'),
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
      './src/cli/openapi-sync/index.ts',
      './src/cli/turbo-select/index.ts',
    ],
    outDir: './dist/cli',
    format: 'esm',
    minify: true,
    clean: true,
    shims: true,
  },
  // Formatters
  {
    entry: ['./src/formatters/prettier.config.js'],
    outDir: './dist/formatters',
    format: 'esm',
    minify: true,
    clean: true,
    onSuccess: async () => {
      await parseJSONC(
        './src/formatters/biome.config.jsonc',
        './dist/formatters/biome.config.json'
      );
    },
  },
  // Linters
  {
    entry: ['./src/linters/eslint.config.ts'],
    outDir: './dist/linters',
    format: 'esm',
    dts: true,
    minify: true,
    clean: true,
    shims: true,
    onSuccess: async () => {
      await parseJSONC(
        './src/linters/oxlint.config.jsonc',
        './dist/linters/oxlint.config.json'
      );
    },
  },
]);
