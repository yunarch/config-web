import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './tests/vitest.globalSetup.ts',
    setupFiles: ['./tests/vitest.setup.ts'],
    testTimeout: 10_000,
  },
  server: {
    watch: {
      ignored: ['**/tests/**/package.json'],
    },
  },
});
