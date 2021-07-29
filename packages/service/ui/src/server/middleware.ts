import { join } from 'path';

import { Application, static as expressStatic } from 'express';

import type { UiServerOptions } from './types';

export async function applyStaticMiddleware(
  app: Application,
  _options: UiServerOptions,
): Promise<Application> {
  const ui = require.resolve('@backyard/service-ui');
  const dist = join(ui, '../../dist');

  app.use(expressStatic(dist));

  app.use((_, res) => {
    res.type('html');
    res.sendFile(join(dist, 'index.html'));
  });

  return app;
}

export async function applyStateMiddleware(
  app: Application,
  options: UiServerOptions,
): Promise<Application> {
  if (options.mode !== 'development') {
    return app;
  }

  app.get('/state.js', (_, res) => {
    const state = JSON.stringify({
      workspaceTitle: 'Hello World',
      workspaceLogoUrl:
        'https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg',
      gatewayBaseUrl: options.gatewayBaseUrl,
      apiAnonKey: options.apiAnonKey,
      serviceFrames: options.modules.map((item) => {
        return {
          name: item.name,
          frameUrl: `http://0.0.0.0:${item.port}`,
          scriptUrl: `http://0.0.0.0:${item.port}/main.js`,
        };
      }),
    });

    res.type('js');
    res.send(`window.BACKYARD_STATE = ${state};`);
  });

  return app;
}
