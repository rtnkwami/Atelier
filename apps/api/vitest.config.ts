import { defaultExclude, defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    exclude: [...defaultExclude, '**/dist/**'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.spec.ts'],
          sequence: {
            shuffle: { tests: true },
            concurrent: true
          },
          fileParallelism: true
        }
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['**/*.e2e-spec.ts'],
          sequence: {
            shuffle: { tests: true },
            concurrent: true
          },
          fileParallelism: true
        }
      }
    ]
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ]
})