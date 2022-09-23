/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup-test-env.ts'],
    coverage: {
      all: true,
      reporter: ['html', 'lcov', 'text'],
      include: ['./app/**/*.{ts,tsx}'],
      exclude: ['postgres-data/', 'node_modules/', 'build/', 'public/'],
    },
    include: [
      './app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      './test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      './cypress',
      './test/e2e',
      './node_modules',
      './build',
      './public',
    ],
    watchExclude: [
      '.*\\/node_modules\\/.*',
      '.*\\/build\\/.*',
      '.*\\/postgres-data\\/.*',
    ],
  },
})
