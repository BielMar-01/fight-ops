import path from 'node:path'
import { fileURLToPath } from 'node:url'

import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const filename = fileURLToPath(import.meta.url)
const rootDir = path.dirname(filename)

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.vite/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'apps/api/src/generated/prisma/**',
    ],
  },

  eslint.configs.recommended,

  {
    files: ['apps/api/**/*.ts'],

    extends: [...tseslint.configs.recommended],

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: rootDir,
      },

      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],

    extends: [...tseslint.configs.recommended],

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: path.resolve(rootDir, 'apps/web'),
      },

      globals: {
        ...globals.browser,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['*.{js,ts}', 'packages/**/*.{js,ts}'],

    extends: [...tseslint.configs.recommended],

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: rootDir,
      },

      globals: {
        ...globals.node,
      },
    },
  },

  eslintConfigPrettier,
)