/**
 * ✅ CONFIGURAÇÃO JEST PARA TESTES
 * Configuração completa para testes unitários, integração e E2E
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho para o Next.js app
  dir: './',
});

// Configuração customizada do Jest
const customJestConfig = {
  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Cobertura
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
  ],
  
  // Thresholds de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Módulos para mockar
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@radix-ui/react-progress$': '<rootDir>/__mocks__/radix-ui-progress.js',
    '^@radix-ui/react-label$': '<rootDir>/__mocks__/radix-ui-label.js',
    '^@radix-ui/react-select$': '<rootDir>/__mocks__/radix-ui-select.js',
    '^@radix-ui/react-dialog$': '<rootDir>/__mocks__/radix-ui-dialog.js',
    '^@radix-ui/react-tooltip$': '<rootDir>/__mocks__/radix-ui-tooltip.js',
    '^class-variance-authority$': '<rootDir>/__mocks__/class-variance-authority.js',
    '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',
    '^sonner$': '<rootDir>/__mocks__/sonner.js',
    '^next/image$': '<rootDir>/__mocks__/next-image.js',
  },
  
  // Extensões de arquivo
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  
  // Ignorar patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/tests/e2e/',  // Testes E2E devem ser executados com Playwright, não Jest
  ],
  
  // Verbose
  verbose: true,
  
  // Timeout
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
