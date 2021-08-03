import { join } from 'path';
import { EOL } from 'os';

import Table from 'cli-table3';
import {
  invariant,
  ContextModeLocal,
  isFunction,
  getServices,
  serviceHasGateway,
} from '@backyard/common';

import { Toolbox } from '../types';

export const SUB_COMMANDS = [
  'build',
  'init',
  'start',
  'stop',
  'restart',
  'clean',
  'cleanup',
  'help',
];

export const SUB_COMMANDS_DESC = [
  'build the local state',
  'alias for `local build`',
  'start docker services',
  'stop docker services',
  'start then stop docker services',
  'remove all .backyard/dev files',
  'remove all .backyard/dev files',
  'this help menu. so meta!',
];

export default {
  name: 'local',
  alias: ['dev', 'development', 'd', 'l'],
  async run(tools: Toolbox) {
    const subCommand = tools.parameters.first ?? 'help';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    await tools.createContext(ContextModeLocal);

    try {
      if (
        subCommand !== 'help' &&
        isFunction(tools.context.platforms.local.before)
      ) {
        await tools.context.platforms.local.before(tools.context);
      }

      switch (subCommand) {
        case 'build':
        case 'init':
          return await init(tools);

        case 'start':
          return await start(tools);

        case 'stop':
          return await stop(tools);

        case 'cleanup':
        case 'clean': {
          return await clean(tools);
        }

        case 'restart': {
          await stop(tools);
          await start(tools);
          return;
        }

        default:
          help(tools);
      }

      if (
        subCommand !== 'help' &&
        isFunction(tools.context.platforms.local.after)
      ) {
        await tools.context.platforms.local.after(tools.context);
      }
    } catch (err) {
      tools.print.error(err.message);
      tools.print.info(err.stack);
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
        'Looks like you do not have a ".backyard" folder. Would you like to run "local build"?',
      )
    ) {
      return await init(tools);
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

export async function init(tools: Toolbox): Promise<void> {
  const { context } = tools;
  const platform = context.platforms.local;
  const localTextFilePath = join(context.dir.stage, 'local.txt');
  // const hasLocalText = tools.filesystem.exists(localTextFilePath);

  const spin = tools.print.spin();
  spin.start('Initalizing...');

  spin.text = 'Preparing stage';

  await tools.prepareStage();

  spin.text = 'Building services';

  for (const [name, service] of context.services) {
    const serviceDir = join(context.dir.stage, name);

    await tools.filesystem.dirAsync(serviceDir);
    await service.stage(serviceDir);
  }

  spin.text = 'Initializing platform';

  try {
    await platform.init(context, tools.parameters.options);
  } catch (err) {
    spin.fail(err.message);
    return;
  }

  const gatewayPort = context.services.get('gateway')?.container?.externalPort;

  const serviceUrls = getServices(context)
    .filter((item) => serviceHasGateway(item))
    .map((item) => {
      return [
        `${item.name.toUpperCase()}_URL`,
        `http://localhost:${gatewayPort}/${item.name}/v1`,
      ];
    });

  const operatorToken = await context.getService('auth').hook('operatorToken');
  const keys = (await context.getService('gateway').hook('keys')) as {
    anonymousKey: string;
    serviceKey: string;
  };

  await tools.filesystem.writeAsync(
    join(context.dir.stage, '.env'),
    [
      ...serviceUrls,
      ['GATEWAY_URL', `http://localhost:${gatewayPort}`],
      ['KEY_ANON', keys.anonymousKey],
      ['KEY_SERVER', keys.serviceKey],
    ]
      .map(([key, value]) => [`BACKYARD_${key}`, value].join('='))
      .join(EOL),
  );

  const uiService = getServices(context).find((item) => item.name === 'ui');

  const localText = [
    'Welcome To Backyard',
    ' ',
    'Looking for some get started documentation: https://github.com/elwood-technology/backyard/blob/main/docs/start/quick.md',
    'Have questions, ask them: https://github.com/elwood-technology/backyard/discussions',
    ' ',
    uiService && 'UI Service is installed. If you have not setup the Auth ',
    uiService &&
      'Service yet, you will need to visit the Setup url to get started',
    uiService &&
      ` Entry: http://${uiService.container?.externalHost}:${uiService.container?.externalPort}/`,
    uiService &&
      ` Setup: http://${uiService.container?.externalHost}:${uiService.container?.externalPort}/auth/setup`,
    uiService && ' ',
    'Here is some important information you may need:',
    ` Operator Token: ${operatorToken}`,
    ` Anonymous Key: ${keys.anonymousKey}`,
    ` Service Key: ${keys.serviceKey}`,
    ' ',
    'Services URLS:',
    ...serviceUrls.map(([key, value]) => ` ${key}: ${value}`),
    ' ',
    'Configured Services',
    ...getServices(context).map(
      (item) => ` ${item.name} (${item.getInitialConfig().provider})`,
    ),
  ].filter(Boolean) as string[];

  await tools.filesystem.writeAsync(localTextFilePath, localText.join(EOL));

  spin.succeed();

  const tbl = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });

  tbl.push([''], ...localText.map((line) => [line]), ['']);

  tools.print.info(tbl.toString());
}

export async function start(tools: Toolbox): Promise<void> {
  const { context } = tools;
  const platform = context.platforms.local;

  if (tools.parameters.options['init'] === true) {
    await init(tools);
  }

  if (!tools.filesystem.exists(context.dir.stage)) {
    if (
      await tools.prompt.confirm(
        'Looks like you do not have a ".backyard/local" folder.\nWould you like to run "local init"?',
        true,
      )
    ) {
      await init(tools);
    }
  }

  const spin = tools.print.spin();

  try {
    spin.start('Starting...');

    await platform.start(context, tools.parameters.options);

    spin.succeed('Started!');
  } catch (err) {
    spin.fail('Error starting');
    tools.print.debug(err.message);
    process.exit(1);
  }
}

export async function stop(tools: Toolbox): Promise<void> {
  const { filesystem, context } = tools;
  const platform = context.platforms.local;
  const spin = tools.print.spin();

  try {
    invariant(filesystem.exists(context.dir.stage), 'Stage does not exist');

    spin.start('Stopping...');

    await platform.stop(context, tools.parameters.options);

    spin.succeed('Stopped!');
  } catch (err) {
    spin.fail('Error stopping');
    tools.print.info(err.message);
    process.exit(1);
  }
}

export async function clean(tools: Toolbox): Promise<void> {
  const { context } = tools;
  const platform = context.platforms.local;
  const spin = tools.print.spin();

  try {
    spin.start('Cleaning platform...');

    await platform.clean(context, tools.parameters.options);

    spin.text = 'Cleaning stage...';

    await tools.filesystem.removeAsync(context.dir.stage);

    spin.succeed('Done!');
  } catch (err) {
    spin.fail('Error cleanup');
    tools.print.info(err.message);
    process.exit(1);
  }
}
