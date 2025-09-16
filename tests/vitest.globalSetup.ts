import { rm, writeFile } from 'node:fs/promises';
import { runTask } from '../src/cli/utils';
import {
  FIXTURE_OXLINT_CONFIG_FILE,
  OPENAPI_SYNC_INPUT,
  OPENAPI_SYNC_OUTPUT,
  openapiSyncExecutor,
} from './test-utils';

/**
 * Setup function to run before tests.
 */
export async function setup() {
  await Promise.all([
    runTask({
      name: 'Generating oxlint file\n',
      command: async () => {
        await writeFile(
          FIXTURE_OXLINT_CONFIG_FILE,
          '{ "extends": ["../../.oxlintrc.json"] }'
        );
      },
      options: {
        showTime: true,
      },
    }),
    runTask({
      name: 'Generating OpenAPI mock files\n',
      command: async () => {
        await openapiSyncExecutor([
          `-i ${OPENAPI_SYNC_INPUT} -o ${OPENAPI_SYNC_OUTPUT} -y -f --include-msw-utils --post-script format:mocks`,
        ]);
      },
      options: {
        showTime: true,
      },
    }),
  ]);
}

/**
 * Teardown function to run after tests.
 */
export async function teardown() {
  await rm(FIXTURE_OXLINT_CONFIG_FILE, { force: true });
}
