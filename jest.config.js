/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  rootDir: './',
  testPathIgnorePatterns: [
    '/node_modules/',
    './dist',
    './scripts',
    './lib',
    // './.husky',
    './.git',
    './.vscode',
    './.idea',
    './.jest-cache',
    './coverage'
  ],
  transform: {
    '\\.[jt]sx?$': 'esbuild-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
  cacheDirectory: '.jest-cache',
  testEnvironment: 'jsdom',
  moduleNameMapper: {}
}

module.exports = config
