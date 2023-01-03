/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    cache: false,
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup-test-env.ts'],
    includeSource: ['./app/**/**.{test,spec}.{js,ts,jsx,tsx}'],
    testTimeout: 10000,
    coverage: {
      all: true,
      provider: 'c8',
      reporter: ['html', 'lcov', 'text'],
      include: ['**/app/**/*.{js,ts,tsx}'],
      exclude: [
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
        'postgres-data/',
        'node_modules/',
        'build/',
        'public/',
        'test/',
      ],
    },
    exclude: [
      './cypress',
      './test/e2e',
      './node_modules',
      './build',
      './public',
      './postgres-data',
    ],
    watchExclude: [
      '.*\\/node_modules\\/.*',
      '.*\\/build\\/.*',
      '.*\\/postgres-data\\/.*',
    ],
  },
})
