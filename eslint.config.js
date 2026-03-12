const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const jestPlugin = require('eslint-plugin-jest');
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      sourceType: 'module',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Symbol: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // General
      'array-callback-return': ['warn'],
      'eqeqeq': ['off', 'always', { null: 'ignore' }],
      'new-parens': ['warn'],
      'no-array-constructor': ['warn'],
      'no-caller': ['warn'],
      'no-cond-assign': ['warn', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error', 'reportException'] }],
      'no-eval': ['warn'],
      'no-extend-native': ['warn'],
      'no-extra-bind': ['warn'],
      'no-implied-eval': ['warn'],
      'no-iterator': ['warn'],
      'no-lone-blocks': ['warn'],
      'no-loop-func': ['warn'],
      'no-multi-str': ['warn'],
      'no-new-wrappers': ['warn'],
      'no-script-url': ['warn'],
      'no-self-compare': ['warn'],
      'no-shadow-restricted-names': ['warn'],
      'no-template-curly-in-string': ['warn'],
      'no-throw-literal': ['warn'],
      'no-use-before-define': ['warn'],
      'no-useless-computed-key': ['warn'],
      'no-useless-concat': ['warn'],
      'no-useless-rename': ['warn'],

      // TypeScript
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      'no-useless-constructor': ['off'],
      '@typescript-eslint/no-useless-constructor': ['warn'],
    },
  },
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    plugins: {
      'jest': jestPlugin,
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
];
