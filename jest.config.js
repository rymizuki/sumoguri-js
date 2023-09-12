/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },
  coveragePathIgnorePatterns: ['<rootDir>/src/test-lib/'],
  coverageThreshold: {
    './src/sumoguri': {
      branches: 81,
      function: 100,
      lines: 100,
      statements: 100
    },
    './src/utils': {
      branches: 82,
      function: 60,
      lines: 87,
      statements: 84
    }
  },
  coverageReporters: ['text', 'html', 'json-summary'],
  reporters: ['default', 'jest-junit']
}
