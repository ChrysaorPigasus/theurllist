// Setup file for Cucumber tests to support ES modules in step definitions
const path = require('path');

// Register Babel to handle JSX files
require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  configFile: path.resolve(__dirname, '../../babel.config.cjs'),
  ignore: [/node_modules/]
});

// Handle module aliases
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@tests': path.resolve(__dirname, '..'),
  '@components': path.resolve(__dirname, '../../src/components'),
  '@features': path.resolve(__dirname, '../../src/components/features'),
  '@ui': path.resolve(__dirname, '../../src/components/ui'),
  '@layouts': path.resolve(__dirname, '../../src/layouts'),
  '@utils': path.resolve(__dirname, '../../src/utils'),
  '@pages': path.resolve(__dirname, '../../src/pages'),
  '@stores': path.resolve(__dirname, '../../src/stores')
});