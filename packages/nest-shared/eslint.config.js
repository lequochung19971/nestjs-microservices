const eslintConfigs = require('@chill-microservice/eslint-config/nest');

module.exports = [
  ...eslintConfigs.vendors,
  {
    ...eslintConfigs.mainConfigs,
    languageOptions: {
      ...eslintConfigs.mainConfigs.languageOptions,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  },
  eslintConfigs.ignoresConfig,
];
