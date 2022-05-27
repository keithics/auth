import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  // automock: true, // doesnt work with dotenv
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/lib/', '/\\.npm/']
};

export default config;
