import { rm, writeFile } from 'node:fs/promises';
import { runTask } from '../src/cli/utils';
import {
  FIXTURE_OXLINT_CONFIG_FILE,
  OPENAPI_GEN_INPUT,
  OPENAPI_GEN_OUTPUT,
  openapiGenExecutor,
} from './test-utils';

/**
 * Setup function to run before tests.
 */
export async function setup() {
  await runTask({
    name: 'Setting up test environment\n',
    command: async (spinner) => {
      spinner.text = 'Creating .oxlintrc.json file...';
      await writeFile(
        FIXTURE_OXLINT_CONFIG_FILE,
        '{ "extends": ["../../.oxlintrc.json"] }'
      );
      spinner.text = 'Generating OpenAPI mock files...';
      await openapiGenExecutor([
        `-i ${OPENAPI_GEN_INPUT} -o ${OPENAPI_GEN_OUTPUT} -y -f --include-msw-utils --post-script format:mocks`,
      ]);
    },
    options: {
      showTime: true,
    },
  });
}

/**
 * Teardown function to run after tests.
 */
export async function teardown() {
  await rm(FIXTURE_OXLINT_CONFIG_FILE, { force: true });
}
