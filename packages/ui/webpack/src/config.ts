import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';

import webpack, {
  optimize,
  HotModuleReplacementPlugin,
  ProvidePlugin,
  Configuration,
} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export type UiWebpackCreateWebpackConfigOptions = {
  mode: 'development' | 'production';
  entry: string;
  context: string;
  typescript?: boolean;
  final?(config: Configuration): Configuration;
};

export async function createWebpackConfig(
  options: UiWebpackCreateWebpackConfigOptions,
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
  const html = require.resolve('@backyard/ui-static');

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
        template: join(dirname(html), 'public-channel.html'),
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
