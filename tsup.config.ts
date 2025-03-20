import { defineConfig } from 'tsup';
import { readFile, writeFile, unlink, copyFile } from 'node:fs/promises';

/**
 * Parses a JSONC file into a JSON file.
 *
 * @param filePath - The path to the JSONC file.
 * @param outputPath - The path to the output JSON file.
 */
async function parseJSONC(filePath: string, outputPath: string) {
  const get2ndOrSpaces = (match: string, str: string) => {
    return str || match.replace(/[^\t\r\n ]/g, ' ');
  };
  const data = await readFile(filePath, 'utf8');
  const jsonString = data
    .replace(/("(?:[^"\\]+|\\.)*")|\/\/[^\r\n]*|\/\*[^]*?\*\//g, get2ndOrSpaces)
    .replace(/("([^"\\]+|\\.)*")|,\s*(?=[\}\]])/g, get2ndOrSpaces);
  const jsonObject = JSON.parse(jsonString) as Record<string, unknown>;
  if ('$schema' in jsonObject) delete jsonObject['$schema'];
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
  },
  // Cli
  {
    entry: ['./src/cli/swagger-sync.ts', './src/cli/turbo-select.ts'],
    outDir: './dist/cli',
    format: 'esm',
    minify: true,
    clean: true,
    shims: true,
  },
  // Formatters
  {
    entry: ['./src/formatters/prettier.config.ts'],
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
  // {
  //   entry: ['./src/linters/eslint.config.ts'],
  //   outDir: './dist/linters',
  //   minify: true,
  //   clean: true,
  //   shims: true,
  //   onSuccess: async () => {
  //     await parseJSONC(
  //       './src/linters/biome.config.jsonc',
  //       './dist/linters/biome.config.json'
  //     );
  //     await parseJSONC(
  //       './src/linters/oxlint.config.jsonc',
  //       './dist/linters/oxlint.config.json'
  //     );
  //   },
  // },
  // Typescript
  {
    entry: ['./src/ts/reset.d.ts'],
    outDir: './dist/ts',
    format: 'esm',
    clean: true,
    onSuccess: async () => {
      unlink('./dist/ts/reset.d.js');
      await copyFile('./src/ts/reset.d.ts', './dist/ts/reset.d.ts');
      await parseJSONC(
        './src/ts/tsconfig-base.jsonc',
        './dist/ts/tsconfig-base.json'
      );
    },
  },
]);
