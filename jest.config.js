const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Next.js 통합 문제 해결
  transformIgnorePatterns: [
    'node_modules/(?!(next|@next)/)',
  ],
  // 모듈 해석 설정
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // 테스트 타임아웃 설정
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
