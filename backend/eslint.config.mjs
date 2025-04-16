import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/', 'eslint.config.mjs'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  eslintConfigPrettier,
);
