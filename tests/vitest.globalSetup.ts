import { runTask } from '../src/cli/utils';
import {
  OPENAPI_SYNC_INPUT,
  OPENAPI_SYNC_OUTPUT,
  openapiSyncExecutor,
} from './test-utils';

/**
 * Setup function to run before tests.
 */
export async function setup() {
  await runTask({
    name: 'Generating OpenAPI mock files\n',
    command: async () => {
      await openapiSyncExecutor([
        `-i ${OPENAPI_SYNC_INPUT} -o ${OPENAPI_SYNC_OUTPUT} -y -f --include-msw-utils ${process.env.CI ? '' : '--post-script format:mocks'}`,
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
  // no-op
}
