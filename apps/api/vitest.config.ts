import { defaultExclude, defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    exclude: [...defaultExclude, '**/dist/**'],
    sequence: {
      concurrent: true,
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.spec.ts'],
          sequence: {
            shuffle: { tests: true },
            concurrent: true,
          },
          fileParallelism: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['**/integration/*.spec.ts'],
          sequence: {
            shuffle: { tests: true },
          },
          fileParallelism: true,
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['**/*.e2e-spec.ts'],
          sequence: {
            shuffle: { tests: true },
            concurrent: true,
          },
          fileParallelism: true,
          env: {
            DATABASE_URL: 'postgres://localhost:5432/test',
            ISSUER_BASE_URL: 'https://test.auth0.com',
            AUDIENCE: 'test-api',
            REDIS_ENDPOINT: 'redis://localhost:6379',
          },
        },
      },
    ],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      test: path.resolve(__dirname, './test'),
    },
  },
});
