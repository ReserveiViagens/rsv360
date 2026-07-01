/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/test/env-defaults.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  globalTeardown: '<rootDir>/src/test/global-teardown.ts',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../apps/site-publico/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
  collectCoverageFrom: [
    'server/modules/payments/services/payment.service.ts',
    'server/modules/payments/services/customer.service.ts',
    'server/modules/payments/services/pix.service.ts',
    'app.js',
    'src/middleware/security-config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 70,
      statements: 70,
    },
  },
};
