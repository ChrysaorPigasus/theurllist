/// <reference types="vitest" />
const { defineConfig } = require('vitest/config');
const react = require('@vitejs/plugin-react');
const path = require('path');
const dotenvFlow = require('dotenv-flow');

// Function to load environment variables based on TEST_ENV
function loadTestEnv() {
  // Get environment from TEST_ENV or default to local
  const testEnv = process.env.TEST_ENV || 'local';
  
  // Load environment variables with dotenv-flow
  dotenvFlow.config({
    path: process.cwd(),
    node_env: testEnv,
  });
  
  return {
    testEnv,
    // Parse additional variables
    testType: process.env.TEST_TYPE || 'all',
    forceMocks: process.env.FORCE_MOCKS === 'true',
    forceIntegrations: process.env.FORCE_INTEGRATIONS === 'true',
  };
}

// Load environment configuration
const { testEnv, testType, forceMocks, forceIntegrations } = loadTestEnv();

// Log test configuration
console.log(`
===========================================
Running Vitest with:
- Test environment: ${testEnv.toUpperCase()}
- Test type: ${testType}
- Force mocks: ${forceMocks}
- Force integrations: ${forceIntegrations}
===========================================
`);

// Determine which files to include based on test type
let includePatterns = [];
let excludePatterns = [
  'tests/api/**/*.spec.{ts,tsx,jsx}', // Exclude all Playwright spec files
  'tests/api/playwright*.{ts,tsx,jsx}',
  'tests/api/global-*.{ts,tsx,jsx}',
  'tests/bdd/**/*.spec.{ts,tsx,jsx}'   // Exclude BDD test files
];

// Configure include patterns based on test type
if (testType === 'all') {
  includePatterns = [
    'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'tests/api/**/*.test.{js,jsx,ts,tsx}'
  ];
} else if (testType === 'unit') {
  includePatterns = ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'];
} else if (testType === 'api') {
  includePatterns = ['tests/api/**/*.test.{js,jsx,ts,tsx}'];
} else {
  // Fallback to standard test pattern if test type is unknown
  includePatterns = [
    'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'tests/api/**/*.test.{js,jsx,ts,tsx}'
  ];
}

module.exports = defineConfig({
  plugins: [react()],
  // Pass environment variables to Vite
  define: {
    'process.env.TEST_ENV': JSON.stringify(testEnv),
    'process.env.TEST_TYPE': JSON.stringify(testType),
    'process.env.FORCE_MOCKS': JSON.stringify(forceMocks),
    'process.env.FORCE_INTEGRATIONS': JSON.stringify(forceIntegrations),
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: includePatterns,
    exclude: excludePatterns,
    // Environment variables for tests
    env: {
      TEST_ENV: testEnv,
      TEST_TYPE: testType,
      FORCE_MOCKS: forceMocks ? 'true' : 'false',
      FORCE_INTEGRATIONS: forceIntegrations ? 'true' : 'false'
    },
    // Configure how tests are run
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: testType === 'api', // Run API tests in single thread
      },
    },
    // Verbeterde code coverage configuratie
    coverage: {
      provider: 'v8', // Gebruik de V8 coverage provider
      reporter: ['text', 'html', 'lcov', 'json-summary'], // Voeg json-summary toe voor tools en dashboards
      reportsDirectory: './coverage', // Output directory
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        'src/types/**',
        'src/utils/init.sql',
      ],
      lines: 80, // Stel coverage drempelwaarden in op 80%
      functions: 80,
      branches: 70,
      statements: 80,
      // Negeer coverage voor onderhoudsfuncties zoals API endpoints, initialisatie functie etc.
      excludeNodeModules: true,
      perFile: true, // Controleer coverage per bestand
      all: true, // Meten ook bestanden die niet direct getest worden
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/components/features'),
      '@features/list-management': path.resolve(__dirname, './src/components/features/list-management'),
      '@features/sharing/': path.resolve(__dirname, './src/components/features/sharing/'),
      '@features/url-management': path.resolve(__dirname, './src/components/features/url-management'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@services': path.resolve(__dirname, './src/services'),
      '@router': path.resolve(__dirname, './src/router'),
      '@views': path.resolve(__dirname, './src/views'),
      '@tests': path.resolve(__dirname, './tests'),
      '@tests/unit': path.resolve(__dirname, './tests/unit'),
      '@tests/api': path.resolve(__dirname, './tests/api'),
      '@tests/mocks': path.resolve(__dirname, './tests/mocks'),
      '@tests/utils': path.resolve(__dirname, './tests/utils'),
      '@tests/components': path.resolve(__dirname, './tests/components'),
      '@tests/hooks': path.resolve(__dirname, './tests/hooks'),
      '@tests/stores': path.resolve(__dirname, './tests/stores'),
      '@tests/assets': path.resolve(__dirname, './tests/assets'),
      '@tests/styles': path.resolve(__dirname, './tests/styles'),
      '@tests/types': path.resolve(__dirname, './tests/types'),
      '@tests/constants': path.resolve(__dirname, './tests/constants'),
      '@tests/services': path.resolve(__dirname, './tests/services'),
      '@tests/router': path.resolve(__dirname, './tests/router'),
      '@tests/layouts': path.resolve(__dirname, './tests/layouts'),
      '@tests/views': path.resolve(__dirname, './tests/views'),
      '@tests/__mocks__': path.resolve(__dirname, './tests/__mocks__'),
      '@tests/__fixtures__': path.resolve(__dirname, './tests/__fixtures__'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      }
    }
  }
});