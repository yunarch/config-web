import { execFile } from 'node:child_process';
import { promisify, styleText, types } from 'node:util';
import { Command } from 'commander';
import ora, { type Options, type Ora as OraInstance } from 'ora';

export const asyncExecFile = promisify(execFile);

/**
 * Executes a given task with a spinner to indicate progress.
 *
 * @param task - The task to execute.
 * @returns Resolves to the command's output.
 *
 * @throws {Error} If the command fails.
 */
export async function runTask<T = string>(task: {
  command: Promise<T> | ((spinner: OraInstance) => T | Promise<T>);
  name: string;
  options?: {
    spinner?: Options['spinner'];
    showTime?: boolean;
  };
}) {
  const { command, name, options } = task;
  const spinner = ora(name);
  spinner.spinner = options?.spinner ?? 'aesthetic';
  const startTime = Date.now();
  spinner.start();
  try {
    const result = types.isPromise(command)
      ? await command
      : await command(spinner);
    spinner.succeed(
      options?.showTime
        ? `${styleText('dim', `${Date.now() - startTime}ms`)} ${name}`
        : undefined
    );
    // Workaround to allow the terminal to change spinner loading icon to a check.
    // Just adding an await of 0ms fixes the issue.
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    return result;
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
