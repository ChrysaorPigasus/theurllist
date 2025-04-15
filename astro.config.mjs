// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

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
    port: 3000
  },
  // Add this configuration to disable dev toolbar and source file attributes
  devToolbar: {
    enabled: process.env.NODE_ENV !== 'production'
  },
  vite: {
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
