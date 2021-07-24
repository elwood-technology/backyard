/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path')
const { defaults } = require('jest-config');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

const { compilerOptions } = require('./tsconfig.base.json')

module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: null,
  testRegex: '/__tests__/.*\\.spec\\.(ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  clearMocks: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: `${resolve(__dirname, '..')}/` })
};
