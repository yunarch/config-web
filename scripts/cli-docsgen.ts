#!/usr/bin/env bun
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const CLI_DIR = path.join(rootDir, 'src/cli');
const DOCS_DIR = path.join(CLI_DIR, '__docs__');

/**
 * Find all CLI tools in the CLI directory.
 * ! A CLI tool is a TypeScript file ending with `.cli.ts`.
 *
 * @returns An array of CLI tools found in the CLI directory.
 */
function findCliTools() {
  const cliTools: { name: string; path: string }[] = [];
  if (!existsSync(CLI_DIR)) return cliTools;
  const directoriesToProcess = [CLI_DIR];
  while (directoriesToProcess.length > 0) {
    const currentDir = directoriesToProcess.shift();
    if (!currentDir) continue;
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '__docs__') {
        directoriesToProcess.push(path.join(currentDir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.cli.ts')) {
        const fullPath = path.join(currentDir, entry.name);
        const name = entry.name.replace(/\.cli\.ts$/, '');
        const relativePath = `./${path.relative(process.cwd(), fullPath)}`;
        cliTools.push({
          name,
          path: relativePath,
        });
      }
    }
  }
  return cliTools;
}

/**
 * Generate documentation for all CLI tools.
 *
 * @returns A promise that resolves when the documentation has been generated.
 */
async function generateDocs() {
  const start = Date.now();
  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });
  const tools = findCliTools();
  const documentationPromises = tools.map(async (tool) => {
    const helpOutput = await Bun.$`bun run ${tool.path} --help`
      .env({ FORCE_COLORS: '0' })
      .text();
    const markdown = `# ${tool.name}\n\n\`\`\`\n${helpOutput}\n\`\`\`\n`;
    const outputPath = path.join(DOCS_DIR, `${tool.name}.md`);
    await writeFile(outputPath, markdown, 'utf8');
  });
  await Promise.all(documentationPromises);
  console.log(`Generated ${tools.length} CLI docs in ${Date.now() - start}ms`);
  exit(0);
}

// Run the documentation generator
await generateDocs();
