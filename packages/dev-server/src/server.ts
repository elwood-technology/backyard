import Koa from 'koa';
import Router from '@koa/router';

import { invariant, requireModule, ContextModeDev } from '@backyard/common';
import type { ServiceHandler } from '@backyard/types';
import { createContext } from '@backyard/context';

export type CreateServerArgs = {
  cwd?: string;
};

export type ServiceDef = {
  handler: ServiceHandler;
};

export async function createServer(args: CreateServerArgs = {}): Promise<Koa> {
  const { cwd = process.cwd() } = args;
  const app = new Koa();
  const router = new Router();

  const context = await createContext({ mode: ContextModeDev, cwd });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: err.message,
      };
    }
  });

  router.get('/_debug', async (ctx) => {
    ctx.type = 'json';
    ctx.body = {
      params: ctx.params,
      headers: ctx.headers,
      query: ctx.query,
    };
  });

  router.get('/explore', async (ctx) => {
    ctx.body = `
      <html>
        <head>
          <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js" charset="UTF-8"></script>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3.50.0/swagger-ui.css"/>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script>
            const ui = SwaggerUIBundle({
                url: "https://petstore.swagger.io/v2/swagger.json",
                dom_id: '#swagger-ui',
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.SwaggerUIStandalonePreset
                ]
              })
            </script>
        </body>
      </html>
    `;
  });

  router.get('/:service/v:version/(.*)?', async (ctx) => {
    const service = context.userServices.get(ctx.params.service);

    invariant(service, `Service "${ctx.params.service}" is not defined`);
    invariant(
      service.apiModulePath,
      'Service "${ctx.params.service}" does not define an API Handler',
    );

    const { handler } = requireModule(service.apiModulePath) as ServiceDef;

    invariant(
      handler,
      `Service "${ctx.params.service}" does not provide an API handler`,
    );

    const {
      type,
      body,
      headers = {},
    } = await handler({
      request: ctx.req,
      backyard: {
        services: [],
      },
    });

    Object.keys(headers).forEach((key) => {
      ctx.header[key] = headers[key];
    });

    ctx.type = type ?? 'text';
    ctx.body = body;
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
