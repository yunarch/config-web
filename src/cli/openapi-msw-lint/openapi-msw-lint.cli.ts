#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';
import { createBaseProgram } from '../utils';
import { displayResults } from './utils/displayResults';
import { findExistingHandlers } from './utils/findExistingHandlers';
import { findServicesUsages } from './utils/findServicesUsages';
import { getMissingHandlers } from './utils/getMissingHandlers';

createBaseProgram()
  .name('openapi-msw-lint')
  .description(
    'CLI tool designed to lint and identifying missing MSW (Mock Service Worker) handlers based on the OpenAPI generated services from `openapi-gen`. It analyzes your codebase to find where service methods are used and suggests appropriate handlers with detailed reporting.'
  )
  .requiredOption(
    '--gen <path>',
    'The output folder from `openapi-gen` script. Where the generated models and openapi schema and type definitions are saved.'
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
${styleText('cyan', 'openapi-msw-lint')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/__tests__/node.js')} \
${styleText('green', '--msw-setup-const')} ${styleText('yellow', 'server')}

Note: If the MSW setup file (passed via ${styleText('green', '--msw-setup-file')}) is a TypeScript file,
you must run the script with a runtime that supports TypeScript (e.g. ${styleText('yellow', 'tsx')}, ${styleText('yellow', 'ts-node')}, or ${styleText('yellow', 'bun')}).

Examples:
${styleText('dim', '$')} \
${styleText('yellow', 'tsx')} ${styleText('cyan', './node_modules/@yunarch/config-web/dist/cli/openapi-msw-lint/openapi-msw-lint.cli.js')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/__tests__/node.ts')} \
${styleText('green', '--msw-setup-const')} ${styleText('yellow', 'server')}

${styleText('dim', '$')} \
${styleText('yellow', 'bun')} ${styleText('yellow', '--bun')} \
${styleText('cyan', 'openapi-msw-lint')} \
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
