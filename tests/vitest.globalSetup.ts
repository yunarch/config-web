import {
  OPENAPI_SYNC_INPUT,
  OPENAPI_SYNC_OUTPUT,
  openapiSyncExecutor,
} from './test-utils';

/**
 * Setup function to run before tests.
 */
export async function setup() {
  await openapiSyncExecutor([
    `-i ${OPENAPI_SYNC_INPUT} -o ${OPENAPI_SYNC_OUTPUT} -f --include-msw-utils`,
  ]);
}

/**
 * Teardown function to run after tests.
 */
export async function teardown() {
  // no-op
}
