// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), partytown()],
  // Add this to align with modern module resolution
  vite: {
    build: {
      sourcemap: 'hidden'
    },
    ssr: {
      noExternal: ['@nanostores/react']
    }
  }
});