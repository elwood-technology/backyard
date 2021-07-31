import express, { Application } from 'express';

import { appendUiDevSeverMockMiddleware } from '@backyard/ui-dev-server';

import type { UiServerOptions } from './types';
import { applyStateMiddleware, applyStaticMiddleware } from './middleware';
import { startServicesWebpack } from './webpack';

export function createServer(): Promise<Application> {
  return new Promise((resolve) => {
    return resolve(express());
  });
}

export function boot(options: UiServerOptions): Promise<Application> {
  return createServer().then(async (app) => {
    await appendUiDevSeverMockMiddleware(app);

    if (options.mode === 'development') {
      await startServicesWebpack(options);
      await applyStateMiddleware(app, options);
    }

    await applyStaticMiddleware(app, options);

    await new Promise((resolve) => {
      app.listen(options.port ?? 8080, () => {
        resolve(null);
      });
    });

    return app;
  });
}
