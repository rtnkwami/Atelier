import { defaultExclude, defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

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
                        concurrent: true,
                    },
                    fileParallelism: true,
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
            src: resolve(__dirname, './src'),
            test: resolve(__dirname, './test'),
        },
    },
});
