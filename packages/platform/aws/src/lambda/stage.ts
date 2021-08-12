// import { join, relative, dirname } from 'path';

// import { ContextModeRemote } from '@backyard/common';
// import type { Context, ContextService } from '@backyard/types';

// import type { NodeBootDevServerArgs } from '@backyard/platform-node';
// import { appRoot } from './constants';

export async function stage(): Promise<void> {
  // dir: string,
  // context: Context,
  // service: ContextService,
  // const rel = relative(context.dir.root, service.apiModulePath as string);
  // const { filesystem } = context.tools;
  // if (context.mode === ContextModeRemote) {
  //   await filesystem.writeAsync(
  //     join(dir, 'index.js'),
  //     `module.exports = require('@backyard/platform-aws-lambda/handler').createHandler(require("./api.js"))`,
  //   );
  //   // await buildApi(context, service);
  //   return;
  // }
  // const args = JSON.stringify({
  //   handlerPath: join(appRoot, rel),
  //   watchPaths: [join(appRoot, dirname(rel))],
  // } as NodeBootDevServerArgs);
  // await filesystem.writeAsync(
  //   join(dir, 'index.js'),
  //   `require('@backyard/platform-node/dev-server').boot(${args})`,
  // );
}

export async function buildApi(): Promise<void> {
  // context: Context,
  // service: ContextService,
  // const { filesystem, which } = context.tools;
  // const apiModulePath = service.apiModulePath!;
  // const folderPath = join(context.dir.stage, service.name);
  // await filesystem.dirAsync(folderPath);
  // const nodeModuleDir = __dirname;
  // await runWebpack({
  //   mode: 'production',
  //   target: 'node',
  //   context: service.moduleRootPath,
  //   entry: {
  //     api: `./${basename(apiModulePath)}`,
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /\.js$/,
  //         use: {
  //           loader: 'babel-loader',
  //           options: {
  //             presets: [
  //               [
  //                 'env',
  //                 {
  //                   targets: {
  //                     node: 'current',
  //                   },
  //                 },
  //               ],
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         test: /\.ts$/,
  //         use: 'ts-loader',
  //         exclude: /node_modules/,
  //       },
  //     ],
  //   },
  //   resolve: {
  //     extensions: ['.ts', '.js'],
  //   },
  //   resolveLoader: {
  //     modules: [
  //       'node_modules',
  //       join(context.dir.root, 'node_modules'),
  //       join(service.moduleRootPath, 'node_modules'),
  //       nodeModuleDir,
  //       resolve(nodeModuleDir, '../../../node_modules'),
  //     ],
  //   },
  //   node: {
  //     __dirname: false,
  //     __filename: false,
  //   },
  //   output: {
  //     libraryTarget: 'commonjs2',
  //     path: folderPath,
  //     filename: 'api.js',
  //   },
  //   plugins: [
  //     new ZipPlugin({
  //       filename: 'function.zip',
  //     }),
  //   ],
  // });
  // await filesystem.copyAsync(
  //   join(service.moduleRootPath, 'package.json'),
  //   join(folderPath, 'package.json'),
  // );
  // await run((await which('yarn')) as string, ['install', '--production'], {
  //   cwd: folderPath,
  //   env: {
  //     ...process.env,
  //     NODE_ENV: 'production',
  //   },
  // });
}

// export function runWebpack(config: webpack.Configuration): Promise<void> {
//   return new Promise((resolve, reject) => {
//     webpack(config, (err, stats) => {
//       if (err) {
//         reject(err);
//       }

//       const errors = stats?.compilation?.errors || [];

//       if (stats?.hasErrors && errors.length > 0) {
//         console.log(stats?.compilation.errors);
//         reject(new Error('Unable to complete webpack'));
//       }

//       resolve();
//     });
//   });
// }

// export function run(
//   cmd: string,
//   args: string[],
//   options: SpawnOptions,
// ): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const proc = spawn(cmd, args, {
//       stdio: 'inherit',
//       ...options,
//     });

//     proc.stdout?.on('data', (data) => {
//       console.log(data.toString());
//     });

//     proc.stderr?.on('data', (data) => {
//       console.log(data.toString());
//     });

//     proc.on('error', reject);
//     proc.on('close', resolve);
//   });
// }
