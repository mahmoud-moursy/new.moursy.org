// @ts-check
import { defineConfig, fontProviders, sharpImageService } from "astro/config";

import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

import fileCompressor from "astro-compressor";
import zlib from "node:zlib";

import sitemap from "@astrojs/sitemap";

import fileMinifier from "astro-compress";
import MINIFIER_CONFIG from "./minifier.config.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://moursy.org",
  integrations: [
    svelte(),
    sitemap(),
    fileMinifier({
      HTML: { "html-minifier-terser": MINIFIER_CONFIG },
      CSS: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
    fileCompressor({
      brotli: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },
      },
      fileExtensions: [".css", ".js", ".html", ".xml", ".cjs", ".mjs", ".svg", ".txt", ".bin"],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["node:events"],
    },
  },

  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        hostname: "moursy.org",
        protocol: "https",
        pathname: "*",
      },
    ],
  },

  server: {
    host: true,
  },

  output: "static",

  fonts: [
    {
      name: "Ancizar Serif",
      cssVariable: "--ancizar-serif",
      provider: fontProviders.google(),
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
    mode: "middleware",
  }),

  experimental: {
    advancedRouting: true,
  },

  image: {
    service: sharpImageService(),
  },
});
