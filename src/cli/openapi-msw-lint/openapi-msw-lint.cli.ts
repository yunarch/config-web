#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';
import { createBaseProgram } from '../utils';
import { displayResults } from './utils/displayResults';
import { findExistingHandlers } from './utils/findExistingHandlers';
import { findRegisteredHandlers } from './utils/findRegisteredHandlers';
import { findServicesUsages } from './utils/findServicesUsages';
import { getDisconnectedHandlers } from './utils/getDisconnectedHandlers';
import { getMissingHandlers } from './utils/getMissingHandlers';

createBaseProgram()
  .name('openapi-msw-lint')
  .description(
    'CLI tool designed to lint and identify missing MSW (Mock Service Worker) handlers based on the OpenAPI generated services from `openapi-gen`. It analyzes your codebase to find where service methods are used and suggests appropriate handlers with detailed reporting.'
  )
  .requiredOption(
    '--gen <path>',
    'The output folder from `openapi-gen` script. Where the generated models and openapi schema and type definitions are saved.'
  )
  .requiredOption(
    '--msw-setup-file <path>',
    'Path to the MSW setup file (file that configures MSW setupServer or setupWorker).'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'openapi-msw-lint')} \
${styleText('green', '--gen')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--msw-setup-file')} ${styleText('yellow', './src/api/msw/node.ts')}

Note: If the MSW setup file is a TypeScript file,
you must run the script with a runtime that supports TypeScript (e.g. ${styleText('yellow', 'tsx')}, ${styleText('yellow', 'ts-node')}, or ${styleText('yellow', 'bun')}).
`
  )
  .action(
    async ({ gen, mswSetupFile }: { gen: string; mswSetupFile: string }) => {
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
        // Find services usages, existing handlers and registered handlers in parallel
        const [servicesUsages, existingHandlers, registeredHandlers] =
          await Promise.all([
            findServicesUsages({
              genPath,
              srcPath,
            }),
            findExistingHandlers({
              srcPath,
              genPath,
            }),
            findRegisteredHandlers(mswSetupFilePath),
          ]);
        // Get missing handlers by comparing services usages with existing handlers and registered handlers
        const missingHandlers = getMissingHandlers(
          servicesUsages,
          existingHandlers,
          path.dirname(mswSetupFilePath)
        );
        const disconnectedHandlers = getDisconnectedHandlers(
          existingHandlers,
          registeredHandlers
        );
        // Display results
        displayResults(missingHandlers, disconnectedHandlers);
        // Exit with error code if there are missing handlers
        process.exit(missingHandlers.length > 0 ? 1 : 0);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }
  )
  .parseAsync(process.argv);
