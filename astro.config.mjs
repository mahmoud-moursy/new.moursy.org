// @ts-check
import {defineConfig, fontProviders} from 'astro/config';

import tailwindcss from '@tailwindcss/vite';



import node from "@astrojs/node";



// https://astro.build/config
export default defineConfig({
  site: "https://moursy.org",

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["node:events"]
    }
  },

  server: {
    host: true,
  },

  output: "server",

  experimental: {
    fonts: [
      {
        name: 'Ancizar Serif',
        cssVariable: '--ancizar-serif',
        provider: fontProviders.fontsource(),
        weights: [400, 600, 900],
        fallbacks: ["serif"]
      }
    ],
    csp: true,
    svgo: true,
  },

  adapter: node({
    mode: "standalone"
  })
});