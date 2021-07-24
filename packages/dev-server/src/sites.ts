import { resolve } from 'path';

import type { Configuration as WebpackConfiguration } from 'webpack';
import startWebpackServer from '@webpack-cli/serve/lib/startDevServer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import { ContextModeDev } from '@backyard/common';
import { createContext } from '@backyard/context';
import type { Context, ContextSite } from '@backyard/types';

export async function startSites(cwd: string): Promise<void> {
  const context = await createContext({
    mode: ContextModeDev,
    cwd,
  });

  if (context.sitesMap.size === 0) {
    return;
  }

  for (const [_, site] of context.sitesMap) {
    const wp = require.resolve('webpack', {
      paths: context.config.resolve.modules ?? [],
    });

    const webpack = require(wp);

    const compiler = webpack(await createWebpackConfig(context, site));
    const devServerOptions: DevServerConfiguration = {
      port: site.port,
      host: '0.0.0.0',
      historyApiFallback: true,
    };

    await startWebpackServer(compiler, devServerOptions, {}, console.log);
  }
}

export async function createWebpackConfig(
  context: Context,
  site: ContextSite,
): Promise<WebpackConfiguration> {
  const config: WebpackConfiguration = {
    context: site.moduleRootPath,
    mode: 'development',
    entry: site.config.entry,
    resolve: {
      extensions: ['.js', '.mjs'],
      modules: [
        ...context.config.resolve.modules,
        resolve(site.moduleRootPath, 'node_modules'),
        'node_modules',
      ],
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [new HtmlWebpackPlugin()],
  };

  if (site.config.webpack) {
    site.config.webpack(config, context);
  }

  return config;
}
