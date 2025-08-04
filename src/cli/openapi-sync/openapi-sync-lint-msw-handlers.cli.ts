#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';
import { createBaseProgram } from '../utils';
import { displayResults } from './lint-msw-handlers/displayResults';
import { findExistingHandlers } from './lint-msw-handlers/findExistingHandlers';
import { findServicesUsages } from './lint-msw-handlers/findServicesUsages';
import { getMissingHandlers } from './lint-msw-handlers/getMissingHandlers';

createBaseProgram()
  .name('openapi-sync-lint-msw-handlers')
  .description(
    'Lint MSW handlers against OpenAPI generated services from `openapi-sync`.\nIt checks for missing handlers based on generated services and your MSW setup.'
  )
  .requiredOption(
    '--gen <path>',
    'The output folder from `openapi-sync` script. Where the generated models and openapi schema and type definitions are saved.'
  )
  .requiredOption(
    '--msw-setup-file <path>',
    'Path to the MSW setup file (file that configures MSW setupServer or setupWorker).'
  )
  .requiredOption(
    '--msw-setup-const <const>',
    'Name of the constant that holds the MSW setup (e.g., server or worker).'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'openapi-sync-lint-msw-handlers')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/__tests__/node.js')} \
${styleText('green', '--msw-setup-const')} ${styleText('yellow', 'server')}

Note: If the MSW setup file (passed via ${styleText('green', '--msw-setup-file')}) is a TypeScript file,
you must run the script with a runtime that supports TypeScript (e.g. ${styleText('yellow', 'tsx')}, ${styleText('yellow', 'ts-node')}, or ${styleText('yellow', 'bun')}).

Examples:
${styleText('dim', '$')} \
${styleText('yellow', 'tsx')} ${styleText('cyan', 'openapi-sync-lint-msw-handlers')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/__tests__/node.ts')} \
${styleText('green', '--msw-setup-const')} ${styleText('yellow', 'server')}

${styleText('dim', '$')} \
${styleText('yellow', 'bun')} ${styleText('yellow', '--bun')} \
${styleText('cyan', 'openapi-sync-lint-msw-handlers')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/__tests__/node.ts')} \
${styleText('green', '--msw-setup-const')} ${styleText('yellow', 'server')}
`
  )
  .action(
    async ({
      gen,
      mswSetupFile,
      mswSetupConst,
    }: {
      gen: string;
      mswSetupFile: string;
      mswSetupConst: string;
    }) => {
      try {
        const cwd = process.cwd();
        const genPath = path.resolve(cwd, gen);
        const srcPath = path.resolve(cwd, '.');
        const mswSetupFilePath = path.resolve(cwd, mswSetupFile);
        // Check if the paths exist and are directories
        if (!existsSync(genPath) || !statSync(genPath).isDirectory()) {
          throw new Error(
            'Generated API folder does not exist or is not a directory'
          );
        }
        if (
          !existsSync(mswSetupFilePath) ||
          !statSync(mswSetupFilePath).isFile()
        ) {
          throw new Error('MSW setup file does not exist or is not a file');
        }
        // Proceed with linting
        const servicesUsages = await findServicesUsages({
          genPath,
          srcPath,
        });
        const existingHandlers = await findExistingHandlers({
          mswSetupFilePath,
          mswSetupConst,
        });
        const missingHandlers = getMissingHandlers(
          servicesUsages,
          existingHandlers,
          path.dirname(mswSetupFilePath)
        );
        displayResults(missingHandlers);
        // Exit with error code if there are missing handlers
        process.exit(missingHandlers.length > 0 ? 1 : 0);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }
  )
  .parseAsync(process.argv);
