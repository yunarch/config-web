import { execSync } from 'node:child_process';
import select from '@inquirer/select';

/**
 * Prompts the user to select a package from the Turborepo package list.
 *
 * @returns A promise that resolves to the selected package name.
 */
export async function selectTurboPackages() {
  const packages = execSync('npx turbo ls', {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  const packageList = packages
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(' ')[0]);
  return await select({
    message: 'Select a package to run the script:',
    choices: packageList.map((opt) => ({ name: opt, value: opt })),
  });
}

/**
 * Prompts the user to select an environment mode (development, staging, production).
 *
 * @returns A promise that resolves to the selected environment mode.
 */
export async function selectEnvironmentMode() {
  return await select({
    message: 'Select a mode to load different env files:',
    choices: [
      { name: 'development', value: 'development' },
      { name: 'staging', value: 'staging' },
      { name: 'production', value: 'production' },
    ],
  });
}
