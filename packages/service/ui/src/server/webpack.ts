import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';

import express from 'express';
import webpack, {
  optimize,
  HotModuleReplacementPlugin,
  ProvidePlugin,
  Configuration,
} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type { UiServerOptions } from './types';

export async function startServicesWebpack(
  options: UiServerOptions,
): Promise<void> {
  const { appendUiDevSeverMiddleware } = require('@backyard/ui-dev-server');

  const workingDirectory = options.workingDirectory ?? process.cwd();

  for (const mod of options.modules) {
    const app = express();

    console.log(join(workingDirectory, dirname(mod.entry)));

    await appendUiDevSeverMiddleware(app, {
      cwd: join(workingDirectory, dirname(mod.entry)),
      port: mod.port,
    });

    await new Promise(() => {
      app.listen(mod.port, () => {
        resolve();
      });
    });

    // try {
    //   const dir = join(workingDirectory, mod.name);
    //   await startWebpack(dir, mod.port);
    // } catch (err) {
    //   console.log(err);
    // }
  }
}

export type ServiceUiCreateWebpackOptions = {
  mode: 'development' | 'production';
  entry: string;
  context: string;
  typescript?: boolean;
  final?(config: Configuration): Configuration;
};

export async function createWebpackConfig(
  options: ServiceUiCreateWebpackOptions,
): Promise<webpack.Configuration> {
  const {
    mode,
    entry,
    context = process.env.WEBPACK_CONTEXT ?? '/var/app',
    typescript,
    final = (config: Configuration) => config,
  } = options;
  const isDevelopment = options.mode === 'development';
  const useTypescript =
    typescript ?? existsSync(join(context, 'tsconfig.json'));

  const config: Configuration = {
    context,
    mode,
    devtool: isDevelopment && 'inline-cheap-source-map',
    entry: {
      main: entry,
    },
    output: {
      publicPath: '/',
      path: join(context, './dist'),
      filename: '[name].js',
      chunkFilename: 'chunk-[name]-[chunkhash].js',
      crossOriginLoading: isDevelopment ? 'anonymous' : 'use-credentials',
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.mjs'],
      modules: [
        resolve(context, '../../node_modules'),
        resolve(context, 'node_modules'),
        'node_modules',
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: join(__dirname, '../../etc/public-channel.html'),
        filename: 'public-channel.html',
        templateParameters: {},
        inject: false,
      }),
      new ProvidePlugin({
        process: 'process/browser',
      }),
    ].filter(Boolean) as Configuration['plugins'],
  };

  if (useTypescript) {
    const configFile = join(context, 'tsconfig.json');

    const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
    const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
    const ReactRefreshTypeScript = require('react-refresh-typescript');

    config.module = {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                context,
                configFile,
                projectReferences: true,
                transpileOnly: true,
                getCustomTransformers: () => ({
                  before: isDevelopment ? [ReactRefreshTypeScript()] : [],
                }),
              },
            },
          ].filter(Boolean),
        },
        ...(config.module?.rules ?? []),
      ],
    };

    config.resolve = {
      ...(config.resolve || {}),
      extensions: ['.js', '.ts', '.tsx', '.mjs'],
      plugins: [new TsconfigPathsPlugin({ configFile })],
    };

    config.plugins?.push(
      ...[
        !isDevelopment && new optimize.ModuleConcatenationPlugin(),
        isDevelopment && new HotModuleReplacementPlugin(),
        isDevelopment && new ReactRefreshPlugin(),
      ].filter(Boolean),
    );
  }

  return final(config);
}
