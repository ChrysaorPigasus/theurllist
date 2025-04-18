/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Lees omgevingsvariabelen voor het bepalen van welke tests worden uitgevoerd
const testType = process.env.TEST_TYPE || 'all';
const testEnv = process.env.TEST_ENV || 'local';
const forceMocks = process.env.FORCE_MOCKS === 'true';
const forceIntegrations = process.env.FORCE_INTEGRATIONS === 'true';

// Log testconfiguratie voor debugging
console.log(`
Running Vitest with:
- Test type: ${testType}
- Environment: ${testEnv}
- Force mocks: ${forceMocks}
- Force integrations: ${forceIntegrations}
`);

// Bepaal welke bestanden moeten worden opgenomen en uitgesloten op basis van testtype
let includePatterns = [];
let excludePatterns = [
  'tests/api/**/*.spec.{ts,tsx,jsx}', // Exclude all Playwright spec files
  'tests/api/playwright*.{ts,tsx,jsx}',
  'tests/api/global-*.{ts,tsx,jsx}',
  'tests/bdd/**/*.spec.{ts,tsx,jsx}'   // Exclude BDD test files
];

// Configureer de include patterns op basis van het testtype
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
  // Fallback naar standaard test pattern als het testtype onbekend is
  includePatterns = [
    'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'tests/api/**/*.test.{js,jsx,ts,tsx}'
  ];
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: includePatterns,
    exclude: excludePatterns,
    // Pass environment variables to tests
    env: {
      TEST_ENV: testEnv,
      TEST_TYPE: testType,
      FORCE_MOCKS: forceMocks ? 'true' : 'false',
      FORCE_INTEGRATIONS: forceIntegrations ? 'true' : 'false'
    },
    // Configuratie voor code coverage
    coverage: {
      provider: 'v8', // Gebruik de V8 coverage provider
      reporter: ['text', 'html', 'lcov'], // Rapportageformaten
      reportsDirectory: './coverage', // Output directory
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        'src/types/**',
        'src/utils/init.sql',
      ]
    }
  },
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '~': resolve(__dirname, './'),
      '@components': resolve(__dirname, './src/components'),
      '@features': resolve(__dirname, './src/components/features'),
      '@features/list-management': resolve(__dirname, './src/components/features/list-management'),
      '@features/sharing/': resolve(__dirname, './src/components/features/sharing/'),
      '@features/url-management': resolve(__dirname, './src/components/features/url-management'),
      '@ui': resolve(__dirname, './src/components/ui'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@pages': resolve(__dirname, './src/pages'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@types': resolve(__dirname, './src/types'),
      '@constants': resolve(__dirname, './src/constants'),
      '@services': resolve(__dirname, './src/services'),
      '@router': resolve(__dirname, './src/router'),
      '@views': resolve(__dirname, './src/views'),
      '@tests': resolve(__dirname, './tests'),
      '@tests/unit': resolve(__dirname, './tests/unit'),
      '@tests/api': resolve(__dirname, './tests/api'),
      '@tests/mocks': resolve(__dirname, './tests/mocks'),
      '@tests/utils': resolve(__dirname, './tests/utils'),
      '@tests/components': resolve(__dirname, './tests/components'),
      '@tests/hooks': resolve(__dirname, './tests/hooks'),
      '@tests/stores': resolve(__dirname, './tests/stores'),
      '@tests/assets': resolve(__dirname, './tests/assets'),
      '@tests/styles': resolve(__dirname, './tests/styles'),
      '@tests/types': resolve(__dirname, './tests/types'),
      '@tests/constants': resolve(__dirname, './tests/constants'),
      '@tests/services': resolve(__dirname, './tests/services'),
      '@tests/router': resolve(__dirname, './tests/router'),
      '@tests/layouts': resolve(__dirname, './tests/layouts'),
      '@tests/views': resolve(__dirname, './tests/views'),
      '@tests/__mocks__': resolve(__dirname, './tests/__mocks__'),
      '@tests/__fixtures__': resolve(__dirname, './tests/__fixtures__'),
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
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
});