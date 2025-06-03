#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { styleText } from 'node:util';
import confirm from '@inquirer/confirm';
import { createBaseProgram, runTask } from '../utils';
import { run as generateModels } from './codegen-models';
import { run as generateMswUtils } from './codegen-msw-utils';
import { run as generateSchemaTypeDefinition } from './codegen-schema-typedef';
import { prepareOutputDirectory, readOpenapiSchemas } from './utils';

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
  .action(
    async ({
      input,
      output,
      forceGen,
      includeMswUtils,
      postScript,
    }: {
      input: string;
      output: string;
      forceGen: boolean;
      includeMswUtils: boolean;
      postScript: string;
    }) => {
      try {
        console.log(styleText('magenta', '\n🚀 openapi-sync\n'));
        const outputDirectory = await prepareOutputDirectory(output);
        const outputSchemaPath = `${outputDirectory}/openapi.json`;
        const outputSchemaTypeDefs = `${outputDirectory}/schema.d.ts`;
        // Read the input and output OpenAPI schemas
        const [inputSchema, outputSchema] = await readOpenapiSchemas(
          input,
          outputSchemaPath
        );
        // Avoid unnecessary generations
        if (outputSchema && inputSchema === outputSchema && !forceGen) {
          console.log(styleText('blue', '\nNo updates required.\n'));
          process.exit(0);
        }
        // If there is no output schema, create it
        else if (!outputSchema) {
          await runTask({
            name: 'Creating local schema',
            command: writeFile(outputSchemaPath, inputSchema),
          });
        }
        // Sync the schemas if they are different
        else if (outputSchema && inputSchema !== outputSchema) {
          console.log(
            styleText(
              'yellow',
              '\n⚠️  Local and remote schemas does not match!\n'
            )
          );
          const confirmed = await confirm({
            message: 'Do you want to use the remote schema? (y/n)?',
          });
          if (confirmed) {
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
        await Promise.all([
          generateSchemaTypeDefinition(outputSchemaPath, outputSchemaTypeDefs),
          generateModels(outputSchemaPath, outputDirectory),
        ]);
        if (includeMswUtils) {
          await generateMswUtils(outputDirectory);
        }
        if (postScript) {
          await runTask({
            name: 'Running post script',
            command: `node --run ${postScript}`,
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
