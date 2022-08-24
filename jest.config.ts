import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  // automock: true, // doesnt work with dotenv
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/jest/jest.serializer.ts'],
  modulePathIgnorePatterns: ['/lib/', '/\\.npm/']
};

export default config;
