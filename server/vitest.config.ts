import { defineConfig, configDefaults } from 'vitest/config';

const INTEGRATION_TESTS = '**/*.integration.test.ts';

const shared = {
  setupFiles: ['./test.setup.ts'],
  testTimeout: 30000,
  hookTimeout: 30000,
};

// Integration tests reach the live HN API and OpenAI, so they are a separate
// project rather than part of the default run.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          ...shared,
          name: 'unit',
          exclude: [...configDefaults.exclude, INTEGRATION_TESTS],
        },
      },
      {
        test: {
          ...shared,
          name: 'integration',
          include: [INTEGRATION_TESTS],
        },
      },
    ],
  },
});
