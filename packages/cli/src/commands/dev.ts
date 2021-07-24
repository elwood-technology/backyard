import { dirname, join } from 'path';
import { spawn, SpawnOptions } from 'child_process';

import { stringify as yaml } from 'yaml';

import type { Context } from '@backyard/types';
import { invariant, ContextModeDev } from '@backyard/common';
import { startServer } from '@backyard/dev-server';

import { DockerComposeService, Toolbox } from '../types';
import * as generate from '../generate';

export const SUB_COMMANDS = [
  'init',
  'start',
  'stop',
  'restart',
  'up',
  'down',
  'serve',
  'clean',
  'help',
];

export const SUB_COMMANDS_DESC = [
  'setup the .backyard/dev folder',
  'start docker services',
  'stop docker services',
  'start then stop docker services',
  'run docker-compose up from .backyard/dev',
  'run docker-compose down from .backyard/dev',
  'run @backyard/dev-server using .backyard/dev',
  'remove all .backyard/dev files',
  'this help menu. so meta!',
];

export default {
  name: 'dev',
  async run(tools: Toolbox) {
    const subCommand = tools.parameters.first ?? 'help';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    try {
      const context = await tools.createContext(ContextModeDev);

      switch (subCommand) {
        case 'init':
          return await init(context, tools);

        case 'start':
          return await start(context, tools);

        case 'stop':
          return await stop(context, tools);

        case 'serve':
          return await serve(context, tools);

        case 'down':
        case 'up': {
          await run(
            getDockerComposePath(tools),
            [subCommand],
            {
              cwd: context.dir.dest,
            },
            tools,
          );
          return;
        }

        case 'clean': {
          await tools.filesystem.removeAsync(context.dir.dest);
          return;
        }

        case 'restart': {
          await stop(context, tools);
          await start(context, tools);
          return;
        }

        default:
          help(tools);
      }
    } catch (err) {
      tools.print.error('Unable to create context');
      tools.print.debug(err.message);
      tools.print.debug(err.stack);
      process.exit(1);
    }
  },
};

export function getDockerComposePath(tools: Toolbox): string {
  const dockerComposeCmdPath = tools.system.which('docker-compose');

  invariant(dockerComposeCmdPath, 'Unable to find "docker-compose" in system');
  return dockerComposeCmdPath;
}

export async function help(tools: Toolbox): Promise<void> {
  const { context } = tools;
  if (!tools.filesystem.exists(context.dir.backyard)) {
    if (
      await tools.prompt.confirm(
        'Looks like you do not have a ".backyard" folder. Would you like to run "dev init"?',
      )
    ) {
      return await init(context, tools);
    }
  }

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

export async function init(context: Context, tools: Toolbox): Promise<void> {
  const dockerComposeCmdPath = getDockerComposePath(tools);
  const spin = tools.print.spin();
  spin.start('Initalizing...');

  spin.text = 'Building files';

  await tools.prepareDest();

  const services: Record<string, DockerComposeService> = {
    kong: generate.kongDockerCompose(context),
    auth: generate.authDockerCompose(context),
    rest: generate.restDockerCompose(context),
    realtime: generate.realtimeDockerCompose(context),
    db: generate.dbDockerCompose(context),
  };

  const files: Array<[string, string]> = [
    ['kong/Dockerfile', generate.kongDockerfile(context)],
    [
      'kong/config.yml',
      yaml(
        generate.kongConfig(context, generate.devServerKongServices(context)),
      ),
    ],
    ['db/Dockerfile', generate.dbDockerfile(context)],
    ['keys.json', JSON.stringify(context.keys)],
    ...(await generate.dbCreateSqlFiles(context)),
  ];

  if (tools.parameters.options['dev-server'] !== false) {
    services.devServer = generate.devServerDockerCompose(context);
    files.push([
      'dev-server/server.js',
      `require('@backyard/dev-server').startServer({ cwd: process.argv[2]})`,
    ]);
  }

  files.push([
    'docker-compose.yml',
    yaml({
      version: '3.6',
      services,
    }),
  ]);

  await Promise.all(
    files.map(async ([fileName, data]) => {
      const filePath = join(context.dir.dest, fileName);
      await tools.filesystem.dirAsync(dirname(filePath));
      await tools.filesystem.writeAsync(filePath, data);
    }),
  );

  if (tools.parameters.options.docker !== false) {
    spin.text = 'Initalizing Docker...';

    await run(
      dockerComposeCmdPath,
      ['build', '--no-cache'],
      {
        cwd: context.dir.dest,
      },
      tools,
    );

    await run(
      dockerComposeCmdPath,
      [
        '--project-name',
        'backyard',
        'up',
        '--no-start',
        '--renew-anon-volumes',
      ],
      {
        cwd: context.dir.dest,
      },
      tools,
    );
  }

  spin.succeed();
}

export async function start(
  context: Context,

  tools: Toolbox,
): Promise<void> {
  const dockerComposeCmdPath = getDockerComposePath(tools);

  if (tools.parameters.options['init'] === true) {
    await init(context, tools);
  }

  const spin = tools.print.spin();

  try {
    spin.start('Starting...');

    await run(
      dockerComposeCmdPath,
      ['--project-name', 'backyard', 'start'],
      {
        cwd: context.dir.dest,
      },
      tools,
    );
    spin.succeed('Started!');
  } catch (err) {
    spin.fail('Error starting');
    tools.print.debug(err.message);
    process.exit(1);
  }
}

export async function stop(
  context: Context,

  tools: Toolbox,
): Promise<void> {
  const dockerComposeCmdPath = getDockerComposePath(tools);
  const spin = tools.print.spin();

  try {
    spin.start('Stopping...');

    await run(
      dockerComposeCmdPath,
      ['--project-name', 'backyard', 'stop'],
      {
        cwd: context.dir.dest,
      },
      tools,
    );
    spin.succeed('Stopped!');
  } catch (err) {
    spin.fail('Error stopping');
    tools.print.info(err.message);
    process.exit(1);
  }
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

export async function serve(context: Context, tools: Toolbox): Promise<void> {
  try {
    const { port, watch, watchPaths } = context.coreServiceSettings
      .devServer || {
      port: 3000,
      watch: false,
      watchPaths: [],
    };

    await startServer(
      { cwd: context.dir.cwd },
      {
        port: tools.parameters.options.port ?? port ?? 3000,
        watch: tools.parameters.options.watch ?? watch ?? false,
        watchPaths: watchPaths ?? [context.dir.source],
        sites: tools.parameters.options.sites ?? true,
      },
    );
  } catch (err) {
    tools.print.error('Error starting dev server');
    tools.print.debug(err.message);
    tools.print.debug(err.stack);
  }
}
