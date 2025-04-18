// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // Configure Tailwind CSS
      configFile: './tailwind.config.js'
    })
  ],
  output: 'server', // Enable server-side rendering
  server: {
    port: 3000,
    // CORS headers
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  // Add this configuration to disable dev toolbar and source file attributes
  devToolbar: {
    enabled: process.env.NODE_ENV !== 'production'
  },
  vite: {
    resolve: {
      alias: {
        '@components': path.resolve('./src/components'),
        '@features': path.resolve('./src/components/features'),
        '@features/list-management': path.resolve('./src/components/features/list-management'),
        '@features/sharing': path.resolve('./src/components/features/sharing'),
        '@features/url-management': path.resolve('./src/components/features/url-management'),
        '@ui': path.resolve('./src/components/ui'),
        '@url-management': path.resolve('./src/components/features/url-management')
      }
    },
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            store: ['nanostores', '@nanostores/react']
          }
        }
      }
    },
    ssr: {
      noExternal: ['@nanostores/react'],
      external: [
        'postgres',
        'pino',
        'pino-pretty'
      ]
    },
    optimizeDeps: {
      exclude: ['postgres', 'pino', 'pino-pretty']
    }
  }
});
