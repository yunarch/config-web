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
        parseJSONC('./src/config.biome.jsonc', './dist/config.biome.json'),
        // Oxlint config
        parseJSONC('./src/config.oxlint.jsonc', './dist/config.oxlint.json'),
        // Typescript
        parseJSONC(
          './src/config.tsconfig-base.jsonc',
          './dist/config.tsconfig-base.json'
        ),
        mkdir('./dist/ts', { recursive: true }),
        copyFile('./src/ts/reset.d.ts', './dist/ts/reset.d.ts'),
        copyFile('./src/ts/utils.d.ts', './dist/ts/utils.d.ts'),
      ]);
    },
  },
  // Cli
  {
    entry: [
      './src/cli/bun-run-all/bun-run-all.cli.ts',
      './src/cli/openapi-sync/openapi-sync.cli.ts',
      './src/cli/openapi-sync/openapi-sync-lint-msw-handlers.cli.ts',
      './src/cli/turbo-select/turbo-select.cli.ts',
    ],
    outDir: './dist/cli',
    format: 'esm',
    minify: true,
    shims: true,
    external: ['fast-glob', 'typescript'],
  },
  // Prettier
  {
    entry: ['./src/config.prettier.js'],
    outDir: './dist',
    format: 'esm',
    minify: true,
    shims: true,
  },
  // Eslint
  {
    entry: ['./src/config.eslint.ts'],
    outDir: './dist',
    format: 'esm',
    dts: true,
    minify: true,
    shims: true,
  },
]);
