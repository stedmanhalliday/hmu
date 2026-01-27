import js from '@eslint/js';
import globals from 'globals';

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

  // Configuration for all JS files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Next.js globals
        React: 'readonly',
        // Google Analytics
        gtag: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Relaxed rules matching previous config
      // varsIgnorePattern ignores PascalCase variables (React components) and underscore-prefixed
      // ESLint can't detect JSX usage, so component imports appear unused
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
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
