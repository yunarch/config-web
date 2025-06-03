#!/usr/bin/env bun
import { styleText } from 'node:util';
import { createBaseProgram } from '../utils';
import { runParallel, runSequential } from './utils';

createBaseProgram()
  .name('bun-run-all')
  .description(
    'Run given package scripts in parallel or sequential by using bun.'
  )
  .argument('<scripts...>', "A list of package scripts' names.")
  .option(
    '-c, --continue-on-error',
    'Continue executing other/subsequent tasks even if a task threw an error'
  )
  .option('-p, --parallel', 'Run a group of tasks in parallel.')
  .option('-s, --sequential', 'Run a group of tasks sequentially.')
  .option('-t, --time', 'Report execution time for each task.')
  .action(
    async (
      scripts: string[],
      options: {
        continueOnError?: boolean;
        parallel?: boolean;
        sequential?: boolean;
        time?: boolean;
      }
    ) => {
      try {
        console.log(styleText('magenta', '\n🚀 bun-run-all\n'));
        const sequential = options.sequential ?? false;
        const parallel = options.parallel ?? !sequential;
        const continueOnError = options.continueOnError ?? false;
        const reportTime = options.time ?? false;
        if (parallel === sequential) {
          console.error(
            'You cannot use both --parallel and --sequential options at the same time.'
          );
          process.exit(1);
        }
        if (sequential) {
          const exitCode = await runSequential(scripts, {
            continueOnError,
            reportTime,
          });
          process.exit(exitCode);
        }
        const exitCode = await runParallel(scripts, {
          continueOnError,
          reportTime,
        });
        process.exit(exitCode);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }
  )
  .parseAsync(process.argv);
