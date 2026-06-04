import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((context, next) => {
  return next().then((res) => {
    if (context.url.pathname.endsWith(".br")) {
      res.headers.set("Content-Encoding", "br");
      res.headers.set("Content-Type", "application/octet-stream");
    }

    return res;
  })
})