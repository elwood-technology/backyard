import Koa from 'koa';
import Router from '@koa/router';

import { invariant } from '@backyard/common';
import type { ServiceHandler } from '@backyard/types';

export function appendServerMiddleware(app: Koa, handler: ServiceHandler): Koa {
  const router = new Router();

  router.get('/__by_debug', async (ctx) => {
    ctx.type = 'json';
    ctx.body = {
      params: ctx.params,
      headers: ctx.headers,
      query: ctx.query,
    };
  });

  router.get('(.*)?', async (ctx) => {
    invariant(
      handler,
      `Service "${ctx.params.service}" does not provide an API handler`,
    );
    const {
      type,
      body,
      code = 200,
      headers = {},
    } = await handler({
      request: ctx.req,
    });
    Object.keys(headers).forEach((key) => {
      ctx.header[key] = headers[key];
    });
    ctx.status = code;
    ctx.type = type ?? 'text';
    ctx.body = body;
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
