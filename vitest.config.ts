import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './tests/vitest.globalSetup.ts',
    setupFiles: ['./tests/vitest.setup.ts'],
  },
  server: {
    watch: {
      ignored: ['**/tests/**/package.json'],
    },
  },
});
