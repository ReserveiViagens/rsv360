import eslintConfigNext from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...eslintConfigNext,
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    rules: {
      // Next 16 / react-hooks v7 — débito T0.6; refatorar efeitos em follow-up
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
