import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: [
        'services/**/*.ts',
        'app/api/**/*.ts',
        'components/**/*.tsx',
        'app/**/page.tsx',
        'app/**/route.ts',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/types/**',
        'services/supabase/**', // Infrastructure, hard to test
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
