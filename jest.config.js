module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // or 'node' if preferred for API tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Optional: if you need global setup
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Handle module aliases
  },
};
