import eslintConfigNext from 'eslint-config-next/core-web-vitals';
import eslintConfigTypescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...eslintConfigNext,
  ...eslintConfigTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'dist/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unsafe-declaration-merging': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@next/next/no-assign-module-variable': 'warn',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
      'react/jsx-no-undef': 'warn',
      'react/jsx-no-duplicate-props': 'warn',
      'prefer-const': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/use-memo': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'import/no-anonymous-default-export': 'warn',
    },
  },
];

export default config;
