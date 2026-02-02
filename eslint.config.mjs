import js from '@eslint/js';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'public/**',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // Configuration for all JS/JSX files
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'readonly',
        gtag: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',

      // React hooks rules
      ...reactHooksPlugin.configs.recommended.rules,
      // Disable set-state-in-effect - intentional for loading initial state from storage/context
      'react-hooks/set-state-in-effect': 'off',

      // Custom rules
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^(_|Component$|pageProps$)',
        varsIgnorePattern: '^([A-Z]|_)',
        ignoreRestSiblings: true
      }],
      'no-console': 'off',
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
