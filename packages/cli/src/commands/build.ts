import { join, resolve, dirname, basename } from 'path';
import { SpawnOptions, spawn } from 'child_process';

import { stringify as yaml } from 'yaml';
import webpack from 'webpack';

import { ContextModeBuild } from '@backyard/common';
import type { Context, ContextService } from '@backyard/types';

import { findNodeModules, findPackageJson } from '../util';
import { KongService, Toolbox } from '../types';
import * as generate from '../generate';

export const SUB_COMMANDS = ['default', 'clean', 'help'];

export const SUB_COMMANDS_DESC = [
  'setup the build folder',
  'remove all .backyard/build files',
  'this help menu. so meta!',
];

export default {
  name: 'build',
  async run(tools: Toolbox) {
    const context = await tools.createContext(ContextModeBuild);

    const subCommand = tools.parameters.first ?? 'default';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    switch (subCommand) {
      case 'help': {
        return await help(tools);
      }

      case 'clean': {
        const spin = tools.print.spin();
        spin.start('Cleaning...');
        await tools.filesystem.removeAsync(context.dir.dest);
        spin.succeed();
        return;
      }

      default: {
        await defaultCommand(tools);
      }
    }
  },
};

export async function help(tools: Toolbox): Promise<void> {
  tools.print.newline();
  tools.print.info(`dev <${SUB_COMMANDS.join('|')}> [options]`);
  tools.print.newline();
  tools.print.table(
    [
      ['Command', 'Description'],
      ...SUB_COMMANDS.map((name, i) => [name, SUB_COMMANDS_DESC[i]]),
    ],
    { format: 'markdown' },
  );
  tools.print.newline();
}

export async function defaultCommand(tools: Toolbox): Promise<void> {
  const { context } = tools;

  const spin = tools.print.spin();
  spin.start('Building dest folder...');

  await tools.prepareDest();

  const services = Array.from(context.userServices.values());

  const kongServices: KongService[] = services.map((item) => {
    return generate.kongService({
      name: item.name,
      version: item.config.version,
      plugins: [
        {
          name: 'aws-lambda',
          config: {
            aws_key: '',
            aws_secret: '',
            aws_region: '',
            function_name: '',
            invocation_type: 'RequestResponse',
            log_type: 'Tail',
            timeout: 60000,
            keepalive: 60000,
          },
        },
      ],
    });
  });

  spin.text = 'Building files...';

  await Promise.all(
    [
      ['kong/Dockerfile', generate.kongDockerfile(context)],
      ['kong/config.yml', yaml(generate.kongConfig(context, kongServices))],
      ['db/Dockerfile', generate.dbDockerfile(context)],
      ...(await generate.dbCreateSqlFiles(context)),
      ...generate.sitesBuildWebpack(context),
    ].map(async ([fileName, data]) => {
      const filePath = join(context.dir.dest, fileName);
      await tools.filesystem.dirAsync(dirname(filePath));
      await tools.filesystem.writeAsync(filePath, data);
    }),
  );

  await Promise.all(
    services
      .filter((item) => item.apiModulePath)
      .map(async (item) => {
        await buildApi(context, item, tools);
      }),
  );

  generate.infraConfigs(context);

  spin.succeed('Build Complete!');
}

export async function buildApi(
  context: Context,
  service: ContextService,
  tools: Toolbox,
): Promise<void> {
  const apiModulePath = service.apiModulePath!;
  const folderPath = join(context.dir.dest, service.name);
  await tools.filesystem.dirAsync(folderPath);

  const nodeModuleDir =
    (await findNodeModules(await findPackageJson(__dirname))) || '';

  await runWebpack({
    mode: 'production',
    target: 'node',
    context: service.moduleRootPath,
    entry: {
      api: `./${basename(apiModulePath)}`,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    resolveLoader: {
      modules: [
        'node_modules',
        join(context.dir.root, 'node_modules'),
        join(service.moduleRootPath, 'node_modules'),
        nodeModuleDir,
        resolve(nodeModuleDir, '../../../node_modules'),
      ],
    },
    output: {
      path: folderPath,
      filename: 'api.js',
    },
  });

  await tools.filesystem.copyAsync(
    join(service.moduleRootPath, 'package.json'),
    join(folderPath, 'package.json'),
  );

  await tools.filesystem.writeAsync(
    join(folderPath, 'index.js'),
    `module.exports = require('@backyard/platform-aws-lambda').createHandler(require('./api.js'))`,
  );

  await run(
    tools.system.which('yarn') as string,
    ['install', '--production'],
    {
      cwd: folderPath,
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    },
    tools,
  );
}

export function runWebpack(config: webpack.Configuration): Promise<void> {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        reject(err);
      }

      const errors = stats?.compilation?.errors || [];

      if (stats?.hasErrors && errors.length > 0) {
        console.log(stats?.compilation.errors);
        reject(new Error('Unable to complete webpack'));
      }

      // console.log(stats);

      resolve();
    });
  });
}

export function run(
  cmd: string,
  args: string[],
  options: SpawnOptions,
  tools: Toolbox,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    proc.stdout?.on('data', (data) => {
      tools.print.info(data.toString());
    });

    proc.stderr?.on('data', (data) => {
      tools.print.info(data.toString());
    });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}
