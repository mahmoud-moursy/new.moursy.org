// @ts-check
import { defineConfig, fontProviders, passthroughImageService } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://moursy.org",

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["node:events"],
    },
  },

  security: {
    checkOrigin: false,
  },

  server: {
    host: true,
  },

  output: "server",

  fonts: [
    {
      name: "Ancizar Serif",
      cssVariable: "--ancizar-serif",
      provider: fontProviders.fontsource(),
      weights: [400, 600, 900],
      fallbacks: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
    },
    {
      name: "Tiny5",
      cssVariable: "--tiny-five",
      provider: fontProviders.google(),
      weights: [400],
      fallbacks: ["monospace"],
    },
  ],

  adapter: node({
    mode: "standalone",
  }),

  image: {
    service: passthroughImageService(),
  },

  integrations: [svelte()],
});
