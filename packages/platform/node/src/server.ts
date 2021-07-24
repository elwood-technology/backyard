import Koa from 'koa';

export async function createServer(): Promise<Koa> {
  const app = new Koa();

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

  return app;
}
