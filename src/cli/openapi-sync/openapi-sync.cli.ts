#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { styleText } from 'node:util';
import confirm from '@inquirer/confirm';
import { asyncExecFile, createBaseProgram, runTask } from '../utils';
import { run as generateModels } from './codegen-models';
import { run as generateMswUtils } from './codegen-msw-utils';
import { run as generateSchemaTypeDefinition } from './codegen-schema-typedef';
import { prepareOutputDirectory } from './codegen-utils/prepareOutputDirectory';
import { readInputOpenapiSchema } from './codegen-utils/readInputOpenapiSchema';
import { readOutputOpenapiSchema } from './codegen-utils/readOutputOpenapiSchema';

createBaseProgram()
  .name('openapi-sync')
  .description(
    'A CLI tool to convert OpenAPI 3.0/3.1 schemas to TypeScript types and create type-safe fetching based on a openapi file and keep them in sync.'
  )
  .requiredOption(
    '-i, --input <path>',
    'The input (local or remote) openapi schema (JSON).'
  )
  .requiredOption(
    '-o, --output <folder>',
    'The output folder to save the generated models and openapi schema and type definitions.'
  )
  .option('-y, --yes', 'Skip confirmation prompts and proceed with defaults.')
  .option(
    '-f, --force-gen',
    'Force generation of typescript schemas and fetching code even if the input and output schemas are identical.'
  )
  .option(
    '--include-msw-utils',
    'Include MSW mocking utilities based on the generated typescript types.'
  )
  .option(
    '--post-script <script>',
    'A package.json script to run after the code generation.'
  )
  .option(
    '--verify-openapi-sync',
    'Verifies that the generated output is up to date with the input (e.g., in CI) to catch outdated or mismatched output without making changes.'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'openapi-sync')} \
${styleText('green', '-i')} ${styleText('yellow', './openapi.json')} \
${styleText('green', '-o')} ${styleText('yellow', './src/api/gen')} \
${styleText('green', '--include-msw-utils')}
`
  )
  .action(
    async ({
      input,
      output,
      yes,
      forceGen,
      verifyOpenapiSync,
      includeMswUtils,
      postScript,
    }: {
      input: string;
      output: string;
      yes: boolean;
      forceGen: boolean;
      verifyOpenapiSync: boolean;
      includeMswUtils: boolean;
      postScript: string;
    }) => {
      try {
        console.log(styleText('magenta', '\n🚀 openapi-sync\n'));
        const outputDirectory = await runTask({
          name: 'Preparing output directory',
          command: async () => {
            return await prepareOutputDirectory(output);
          },
        });
        const outputSchemaPath = `${outputDirectory}/openapi.json`;
        const outputSchemaTypeDefs = `${outputDirectory}/schema.d.ts`;
        // Read the input and output OpenAPI schemas
        const [inputSchema, outputSchema] = await runTask({
          name: 'Reading OpenAPI schemas',
          command: async () => {
            const [inputContent, outputContent] = await Promise.all([
              readInputOpenapiSchema(input),
              readOutputOpenapiSchema(outputSchemaPath),
            ]);
            return [
              JSON.stringify(JSON.parse(inputContent)),
              outputContent ? JSON.stringify(JSON.parse(outputContent)) : false,
            ] as const;
          },
        });
        const hasChanges = inputSchema !== outputSchema;
        // Only verify than the output is up to date with the input.
        // We assume than if inputSchema is equal to outputSchema, the generated output is up to date.
        if (verifyOpenapiSync) {
          console.log(
            hasChanges
              ? styleText(
                  'yellow',
                  '\n⚠️  Local and remote schemas does not match!\n'
                )
              : styleText('green', '\n✅ Local and remote schemas match!\n')
          );
          process.exit(hasChanges ? 1 : 0);
        }
        // If output schema does not exists we create it always, so next time check can be faster.
        if (outputSchema === false) {
          await runTask({
            name: 'Creating local schema',
            command: writeFile(outputSchemaPath, inputSchema),
          });
        }
        // If there are no changes and we are not forcing generation, exit
        if (!hasChanges && !forceGen) {
          console.log(styleText('blue', '\nNo updates required.\n'));
          process.exit(0);
        }
        // If there are changes we will proceed with syncing the schemas process
        else if (hasChanges) {
          console.log(
            styleText(
              'yellow',
              '\n⚠️  Local and remote schemas does not match!\n'
            )
          );
          if (
            yes ||
            (await confirm({
              message: 'Do you want to use the remote schema? (y/n)?',
            }))
          ) {
            await runTask({
              name: 'Replacing local schema with input schema',
              command: writeFile(outputSchemaPath, inputSchema),
            });
          } else {
            console.log(
              styleText('yellow', '\n⚠️  Sync remote schemas skipped.\n')
            );
            if (!forceGen) process.exit(0);
          }
        }
        // Generate code
        await runTask({
          name: 'Generating code from OpenAPI schema',
          command: async () => {
            const promises = [
              generateSchemaTypeDefinition(
                outputSchemaPath,
                outputSchemaTypeDefs
              ),
              generateModels(outputSchemaPath, outputDirectory),
            ];
            if (includeMswUtils) {
              promises.push(generateMswUtils(outputDirectory));
            }
            await Promise.all(promises);
          },
        });
        if (postScript) {
          await runTask({
            name: 'Running post script',
            command: async () => {
              try {
                const isBun = typeof Bun !== 'undefined';
                await (isBun
                  ? asyncExecFile('bun', ['run', postScript])
                  : asyncExecFile('node', ['--run', postScript]));
              } catch {
                await asyncExecFile('npm', ['run', postScript], {
                  shell: true,
                });
              }
            },
          });
        }
        // Success message
        console.log(
          styleText('green', '\n✅ openapi-sync process completed!\n')
        );
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }
  )
  .parseAsync(process.argv);
