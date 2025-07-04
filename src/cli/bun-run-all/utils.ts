import { styleText } from 'node:util';

// List of supported colors for styling text
const COLORS = ['blue', 'green', 'yellow', 'grey', 'white', 'cyan'] as const;
const getExecutionTime = (start: number) => {
  const durationMs = Number(Bun.nanoseconds() - start) / 1_000_000;
  return `${(durationMs / 1000).toFixed(2)}s`;
};

/**
 * Report the execution log of the tasks.
 *
 * @param options - Options for reporting the execution log.
 */
function reportExecutionLog({
  start,
  tasks,
  failedTasks,
}: {
  start: number;
  tasks: number;
  failedTasks: number;
}) {
  const successTasks = tasks - failedTasks;
  const executionTime = getExecutionTime(start);
  const failedTasksText =
    failedTasks > 0 ? styleText('red', `${failedTasks} failed`) : '';
  const successTasksText =
    successTasks > 0 ? styleText('green', `${successTasks} successful`) : '';
  console.log('');
  console.log(
    styleText(['white', 'bold'], 'Tasks:\t'),
    `${failedTasksText}${failedTasksText && successTasksText ? '|' : ''}${successTasksText}`,
    styleText('gray', `-- ${tasks} total`)
  );
  console.log(
    styleText(['white', 'bold'], 'Time:\t'),
    styleText('gray', `${executionTime}\n`)
  );
}

/**
 * Spawn a process to run a script.
 *
 * @param options - Options for spawning the process.
 * @returns The spawned process.
 */
function spawnProc({
  index,
  script,
  continueOnError,
  reportTime,
}: {
  index: number;
  script: string;
  continueOnError: boolean;
  reportTime: boolean;
}) {
  const color = COLORS[index % COLORS.length];
  const start = Bun.nanoseconds();
  const proc = Bun.spawn(['bun', 'run', script], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      FORCE_COLOR: '1',
    },
    onExit(_, exitCode) {
      if (exitCode === 1 && !continueOnError) process.exit(1);
    },
  });
  proc.stdout.pipeTo(
    new WritableStream<Uint8Array>({
      write(chunk) {
        const lines = new TextDecoder().decode(chunk).split('\n');
        for (const line of lines) {
          console.log(styleText([color, 'bold'], `${script}:`), line);
        }
      },
    })
  );
  proc.stderr.pipeTo(
    new WritableStream<Uint8Array>({
      write(chunk) {
        const lines = new TextDecoder().decode(chunk).split('\n');
        for (const line of lines) {
          console.log(styleText([color, 'bold'], `${script}:`), line);
        }
      },
    })
  );
  proc.exited.then((code) => {
    if (code === 0 && reportTime) {
      console.log(
        styleText([color, 'bold'], `${script}:`),
        styleText(['gray'], 'Finished in'),
        styleText(['white', 'bold'], getExecutionTime(start))
      );
    }
  });
  return proc;
}

/**
 * Run a list of scripts in parallel.
 *
 * @param scripts - List of scripts to run.
 * @param options - Options for running the scripts.
 * @returns The exit code indicating success or failure.
 */
export async function runParallel(
  scripts: string[],
  options: { continueOnError: boolean; reportTime: boolean }
) {
  const { continueOnError, reportTime } = options;
  const start = Bun.nanoseconds();
  const procs = scripts.map((script, index) =>
    spawnProc({ index, script, continueOnError, reportTime })
  );
  const promises = await Promise.allSettled(procs.map((proc) => proc.exited));
  const failedTasks = promises.filter(
    (promise) => promise.status === 'rejected' || promise.value !== 0
  ).length;
  reportExecutionLog({
    start,
    tasks: scripts.length,
    failedTasks,
  });
  return failedTasks > 0 ? 1 : 0;
}

/**
 * Run a list of scripts sequentially.
 *
 * @param scripts - List of scripts to run.
 * @param options - Options for running the scripts.
 * @returns The exit code indicating success or failure.
 */
export async function runSequential(
  scripts: string[],
  options: { continueOnError: boolean; reportTime: boolean }
) {
  const { continueOnError, reportTime } = options;
  const start = Bun.nanoseconds();
  let failedTasks = 0;
  for (const [index, script] of scripts.entries()) {
    const proc = spawnProc({ index, script, continueOnError, reportTime });
    // eslint-disable-next-line no-await-in-loop -- Intentional sequential execution.
    const exitCode = await proc.exited;
    if (exitCode !== 0) failedTasks++;
  }
  reportExecutionLog({ start, tasks: scripts.length, failedTasks });
  return failedTasks > 0 ? 1 : 0;
}
