const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginPrettier = require('eslint-plugin-prettier');

const vendors = [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier];
const mainConfigs = {
  files: ['**/*.ts', '**/*.js'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
    globals: {
      // Node.js globals
      global: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      console: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
      // Jest globals
      describe: 'readonly',
      test: 'readonly',
      it: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      jest: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    prettier: eslintPluginPrettier,
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript specific rules
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',

    // Import rules
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'off',
      { devDependencies: ['**/*.test.js', '**/*.spec.js'] },
    ],

    // General rules
    'no-param-reassign': 'off',
    'no-use-before-define': 'warn',
    'no-useless-constructor': 'off',
    'no-empty-function': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-shadow': 'off',
  },
};
const ignoresConfig = {
  ignores: ['eslint.config.js', 'dist/**', 'node_modules/**', 'coverage/**', '*.d.ts'],
};
module.exports = {
  vendors,
  mainConfigs,
  ignoresConfig,
};
