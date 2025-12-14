import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
        '**/prisma/**',
        '**/*.d.ts'
      ]
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,vue}'],
    exclude: ['node_modules', '.nuxt', 'dist']
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '~/lib': resolve(__dirname, 'lib'),
      '~/components': resolve(__dirname, 'components'),
      '~/server': resolve(__dirname, 'server')
    }
  }
})
