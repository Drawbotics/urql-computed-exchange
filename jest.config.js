const path = require('path');

module.exports = {
  verbose: false,
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname, 'src'),
  coverageDirectory: './coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.test.ts$',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { diagnostics: false }],
  },
};
