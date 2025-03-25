import { exec } from 'node:child_process';
import { styleText, promisify, types } from 'node:util';
import { Command } from 'commander';
import ora from 'ora';

// Async version of exec
const asyncExec = promisify(exec);

/**
 * Executes a given task with a spinner to indicate progress.
 *
 * @param task - The task to execute.
 * @returns Resolves to the command's output.
 */
export async function runTask<T = string>(task: {
  command: string | Promise<T> | (() => Promise<T>);
  name: string;
}) {
  const { command, name } = task;
  const spinner = ora(name);
  spinner.spinner = 'aesthetic';
  spinner.start();
  try {
    const result =
      typeof command === 'string'
        ? await asyncExec(command)
        : types.isPromise(command)
          ? await command
          : await command();
    spinner.succeed();
    // Workaround to allow the terminal to change spinner loading icon to a check.
    // Just adding an await of 0ms fixes the issue.
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    return typeof result === 'object' && result && 'stdout' in result
      ? result.stdout
      : result;
  } catch (error) {
    const e = error as { stderr?: string; message?: string };
    spinner.fail(styleText('red', e.stderr ?? e.message ?? ''));
    throw error;
  }
}

/**
 * Creates a new instance of the base program with custom help and output configurations.
 *
 * @returns the base program instance.
 */
export function createBaseProgram() {
  const program = new Command();
  program
    .configureHelp({
      styleTitle: (str) => styleText('bold', str),
      styleCommandText: (str) => styleText('cyan', str),
      styleCommandDescription: (str) => styleText('magenta', str),
      styleDescriptionText: (str) => styleText('italic', str),
      styleOptionText: (str) => styleText('green', str),
      styleArgumentText: (str) => styleText('yellow', str),
      styleSubcommandText: (str) => styleText('blue', str),
    })
    .configureOutput({
      outputError: (str, write) => {
        write(styleText('red', str));
      },
    });
  return program;
}
