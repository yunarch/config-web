import { styleText } from "node:util";
import { execSync } from "node:child_process";
import select from "@inquirer/select";
import { createBaseProgram } from "./utils";

/**
 * Prompts the user to select a package from the Turborepo package list.
 *
 * @returns A promise that resolves to the selected package name.
 */
async function selectTurboPackages() {
  const packages = execSync("npx turbo ls", { encoding: "utf8", stdio: "pipe" });
  const packageList = packages
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(" ")[0]);
  return await select({
    message: "Select a package to run the script:",
    choices: packageList.map((opt) => ({ name: opt, value: opt })),
  });
}

/**
 * Prompts the user to select an environment mode (development, staging, production).
 *
 * @returns A promise that resolves to the selected environment mode.
 */
async function selectEnvironmentMode() {
  return await select({
    message: "Select a mode to load different env files:",
    choices: [
      { name: "development", value: "development" },
      { name: "staging", value: "staging" },
      { name: "production", value: "production" },
    ],
  });
}

/**
 * Main function to run the CLI script
 *
 * @param options - The CLI options.
 */
async function run({ run, selectEnv }: { run: string; selectEnv?: boolean }) {
  console.log(styleText("magenta", "\n🚀 Turbo-Select ✨\n"));
  const filter = await selectTurboPackages();
  const environment = selectEnv ? await selectEnvironmentMode() : undefined;
  execSync(
    `turbo run ${run} --ui stream ${filter ? `--filter=${filter}` : ""} ${environment ? `-- --mode ${environment}` : ""}`,
    {
      encoding: "utf8",
      stdio: "inherit",
    }
  );
}

// Define and run the CLI program
createBaseProgram()
  .name("turbo-select")
  .description(
    "A CLI tool to filter and select a single package from the Turborepo package list and run a script command.\nAdditionally, allow to prompt environment mode (development, staging, production), for example, when using Vite."
  )
  .requiredOption(
    "--run <script>",
    "The package script command to execute (e.g., --run=dev)."
  )
  .option(
    "--select-env",
    "An environment mode (development, staging, production) If using for example vite."
  )
  .action(async (options) => {
    try {
      await run({
        run: options.run,
        selectEnv: options.selectEnv,
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .parseAsync(process.argv);
