import { join } from 'path';

import { exists, findAsync } from 'fs-jetpack';
import { Application, static as expressStatic } from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import type { JsonObject } from '@backyard/types';
import { createWebpackConfig } from '@backyard/ui-webpack';

import { mocks } from './mock';

type Options = {
  cwd: string;
  port?: number;
  gatewayBaseUrl: string;
  apiAnonKey: string;
  webpackContextPath?: string;
  workingDirectory?: string;
  modules: Array<{
    name: string;
    entry: string;
    port: number;
  }>;
};

export async function getWebpackConfig(
  mode: 'development' | 'production',
  context: string,
  entry: string,
): Promise<webpack.Configuration> {
  if (exists(join(context, 'webpack.config.js'))) {
    return require(join(context, 'webpack.config.js'));
  }

  return await createWebpackConfig({
    mode,
    entry,
    context,
  });
}

export async function appendUiDevServerWebpackMiddleware(
  app: Application,
  rootWebpackConfig: webpack.Configuration,
): Promise<Application> {
  const entry = (rootWebpackConfig.entry || {}) as JsonObject;

  const webpackConfig = {
    ...rootWebpackConfig,
    entry: Object.keys(entry).reduce((current, key) => {
      return {
        ...current,
        [key]: [
          'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
          entry[key],
        ],
      };
    }, {}),
    devServer: {
      hot: true,
      historyApiFallback: true,
    },
  } as webpack.Configuration;
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler));
  app.use(webpackHotMiddleware(compiler, { reload: true, heartbeat: 2000 }));

  return app;
}

export async function appendUiDevSeverMiddleware(
  app: Application,
  options: Options,
): Promise<Application> {
  const { cwd } = options;
  const ui = require.resolve('@backyard/service-ui');
  const dist = join(ui, '../../dist');

  const backyardUiFile = (
    await findAsync(cwd, {
      matching: 'backyard-ui.*',
    })
  ).shift();

  if (!backyardUiFile) {
    throw new Error('Unable to find a backyard-ui file');
  }

  app.use(expressStatic(dist));

  const rootWebpackConfig = await getWebpackConfig(
    'development',
    cwd,
    `./${backyardUiFile}`,
  );

  await appendUiDevServerWebpackMiddleware(app, rootWebpackConfig);

  app.get('/authz/v1/services', async (_, res) => {
    res.json({
      services: [
        {
          name: 'service',
          ui: true,
        },
      ],
    });
  });

  app.get('/state.js', (_, res) => {
    const state = JSON.stringify({
      gatewayBaseUrl: options.gatewayBaseUrl,
      apiAnonKey: options.apiAnonKey,
      serviceFrames: options.modules.map((item) => {
        return {
          name: item.name,
          frameUrl: `http://0.0.0.0:8080/public-channel.html`,
          scriptUrl: '/main.js',
        };
      }),
    });

    res.type('js');
    res.send(`window.BACKYARD_STATE = ${state};`);
  });

  app.use((_, res) => {
    res.type('html');
    res.sendFile(join(dist, 'index.html'));
  });

  return app;
}

export async function appendUiDevSeverMockMiddleware(
  app: Application,
): Promise<Application> {
  mocks.forEach((endpoint) => {
    app[endpoint.method](endpoint.path, function (_req, res) {
      res.json(endpoint.data);
    });
  });

  return app;
}
