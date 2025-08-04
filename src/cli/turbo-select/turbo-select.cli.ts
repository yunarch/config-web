#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { styleText } from 'node:util';
import { createBaseProgram } from '../utils';
import { selectEnvironmentMode, selectTurboPackages } from './utils';

createBaseProgram()
  .name('turbo-select')
  .description(
    'A CLI tool to filter and select a single package from the Turborepo package list and run a script command.\nAdditionally, allow to prompt environment mode (development, staging, production), for example, when using Vite.'
  )
  .requiredOption(
    '--run <script>',
    'The package script command to execute (e.g., --run=dev).'
  )
  .option(
    '--select-env',
    'An environment mode (development, staging, production) If using for example vite.'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'turbo-select')} \
${styleText('green', '--run')} ${styleText('yellow', 'dev')} \
${styleText('green', '--select-env')}
`
  )
  .action(async ({ run, selectEnv }: { run: string; selectEnv?: boolean }) => {
    try {
      console.log(styleText('magenta', '\n🚀 Turbo-Select\n'));
      const filter = await selectTurboPackages();
      const environment = selectEnv ? await selectEnvironmentMode() : undefined;
      execSync(
        `turbo run ${run} --ui stream ${filter ? `--filter=${filter}` : ''} ${environment ? `-- --mode ${environment}` : ''}`,
        {
          encoding: 'utf8',
          stdio: 'inherit',
        }
      );
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .parseAsync(process.argv);
