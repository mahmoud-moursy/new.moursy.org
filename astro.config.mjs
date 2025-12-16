// @ts-check
import {defineConfig, fontProviders} from 'astro/config';

import tailwindcss from '@tailwindcss/vite';



// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  experimental: {
    fonts: [
      {
        name: 'Ancizar Serif',
        cssVariable: '--ancizar-serif',
        provider: fontProviders.google(),
        weights: [400, 600, 900]
      }
    ]
  }
});