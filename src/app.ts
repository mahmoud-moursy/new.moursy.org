import { serveStatic } from "@hono/node-server/serve-static";
import { astro } from "astro/hono";
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Hono middleware
app.use(logger());
if (import.meta.env.PROD)
  app.use(
    "/*",
    serveStatic({
      root: "./dist/client",
      precompressed: true,
    }),
  );

// Astro handlers (as Hono middleware)
app.use(astro());

export default app;
