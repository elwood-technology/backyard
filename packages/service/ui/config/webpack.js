const { resolve, join } = require('path');

const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { default: ReactRefreshTypeScript } = require('react-refresh-typescript');
const { optimize, HotModuleReplacementPlugin } = require('webpack');

// require('dotenv').config({
//   path: resolve(__dirname, '../../../../.backyard/local/.env'),
// });

const mockServerOptions = require('./mock-server');

const isDevelopment = process.env.NODE_ENV !== 'production';
const context = resolve(__dirname, '..');
const configFile = resolve(context, 'tsconfig.json');

const devEntry = isDevelopment
  ? { test: './src/client/__fixtures__/test-app.tsx' }
  : {};

module.exports = {
  context,
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment && 'inline-cheap-source-map',
  entry: {
    main: './src/client/entry.tsx',
    ...devEntry,
  },
  output: {
    publicPath: '/',
    path: join(context, './dist'),
    filename: isDevelopment ? '[name].js' : '[name]-[contenthash].js',
    chunkFilename: 'chunk-[name]-[chunkhash].js',
    crossOriginLoading: isDevelopment ? 'anonymous' : 'use-credentials',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // include: resolve(context, './src'),
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
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: resolve(__dirname, 'postcss.config.js'),
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      // crypto: require.resolve('crypto-browserify'),
      // stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer-browserify'),
      assert: require.resolve('assert-browserify'),
    },
    extensions: ['.mjs', '.js', '.ts', '.tsx'],
    modules: [
      resolve(context, '../../node_modules'),
      resolve(context, 'node_modules'),
      'node_modules',
    ],
    plugins: [new TsconfigPathsPlugin({ configFile })],
  },
  devServer: {
    host: '0.0.0.0',
    hot: true,
    historyApiFallback: true,
    disableHostCheck: true,
    ...mockServerOptions,
  },
  plugins: [
    !isDevelopment && new optimize.ModuleConcatenationPlugin(),
    isDevelopment && new HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/client/template.html',
      filename: 'index.html',
      templateParameters: {},
      chunks: ['main'],
    }),

    isDevelopment &&
    new HtmlWebpackPlugin({
      template: '../../ui/static/public-channel.html',
      filename: 'test.html',
      templateParameters: {},
      chunks: [],
    }),
    // new ProvidePlugin({
    //   process: 'process/browser',
    // }),
  ].filter(Boolean),
};

if (!isDevelopment) {
  // module.exports.plugins.push(
  //   new SriPlugin({
  //     hashFuncNames: ['sha256', 'sha384'],
  //     enabled: true,
  //   }),
  // );

  module.exports.optimization = {
    minimize: true,
    moduleIds: isDevelopment ? 'named' : 'size',
    chunkIds: isDevelopment ? 'named' : 'size',
    splitChunks: {
      cacheGroups: {
        bundle: {
          name: 'commons',
          chunks: 'all',
          minChunks: 3,
          reuseExistingChunk: false,
        },
        prismjs: {
          test: /[\\/]node_modules[\\/](prismjs)[\\/]/,
          name: 'prismjs-vendor',
          chunks: 'async',
        },
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          minChunks: 1,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  };
}
