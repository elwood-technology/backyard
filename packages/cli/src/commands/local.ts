import { invariant, debug, ContextModeLocal } from '@backyard/common';

import { Toolbox } from '../types';

const log = debug('backyard:cli');

export const SUB_COMMANDS = [
  'build',
  'start',
  'stop',
  'restart',
  'clean',
  'cleanup',
  'help',
];

export const ALIAS_COMMANDS = ['start', 'stop', 'restart'];

export const SUB_COMMANDS_DESC = [
  'build the local state',
  'start docker services',
  'stop docker services',
  'start then stop docker services',
  'remove all .backyard/dev files',
  'remove all .backyard/dev files',
  'this help menu. so meta!',
];

export function findSubCommand(tools: Toolbox): string {
  const subCommand = tools.parameters.first;

  if (!subCommand) {
    const argv: string[] = tools.parameters.argv ?? [];

    for (const arg of argv) {
      if (ALIAS_COMMANDS.includes(arg)) {
        return arg;
      }
    }
  }

  return subCommand ?? 'help';
}

export default {
  name: 'local',
  alias: ['dev', 'development', 'd', 'l', 'start', 'stop', 'restart'],
  async run(tools: Toolbox) {
    const subCommand = findSubCommand(tools);

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    try {
      await tools.createContext(ContextModeLocal);

      if (subCommand !== 'help') {
        await tools.context.platforms.local.executeHook('before', {
          context: tools.context,
        });
      }

      switch (subCommand) {
        case 'build':
          return await build(tools);

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

      if (subCommand !== 'help') {
        await tools.context.platforms.local.executeHook('after', {
          context: tools.context,
        });
      }
    } catch (err) {
      log(err.message);
      log(err.stack);
      tools.errorBox(err);
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
      return await build(tools);
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

export async function build(tools: Toolbox): Promise<void> {
  const { context } = tools;
  const platform = context.platforms.local;
  // const localTextFilePath = join(context.dir.stage, 'local.txt');
  // const hasLocalText = tools.filesystem.exists(localTextFilePath);

  const spin = tools.print.spin();
  spin.start('Initalizing...');

  spin.text = 'Preparing stage';

  await tools.prepareStage();

  spin.text = 'Initializing platform';

  spin.stop();

  try {
    await platform.executeHook('build', {
      context,
      commandOptions: tools.parameters.options,
    });
  } catch (err) {
    spin.fail(err.message);
    console.log(err.stack);
    return;
  }

  // const gatewayPort = context.services.get('gateway')?.container?.externalPort;

  // const serviceUrls = getServices(context)
  //   .filter((item) => serviceHasGateway(item))
  //   .map((item) => {
  //     return [
  //       `${item.name.toUpperCase()}_URL`,
  //       `http://localhost:${gatewayPort}/${item.name}/v1`,
  //     ];
  //   });

  // const operatorToken = await context.getService('auth').hook('operatorToken');
  // const keys = (await context.getService('gateway').hook('keys')) as {
  //   anonymousKey: string;
  //   serviceKey: string;
  // };

  // await tools.filesystem.writeAsync(
  //   join(context.dir.stage, '.env'),
  //   [
  //     ...serviceUrls,
  //     ['GATEWAY_URL', `http://localhost:${gatewayPort}`],
  //     ['KEY_ANON', keys.anonymousKey],
  //     ['KEY_SERVER', keys.serviceKey],
  //   ]
  //     .map(([key, value]) => [`BACKYARD_${key}`, value].join('='))
  //     .join(EOL),
  // );

  // const uiService = getServices(context).find((item) => item.name === 'ui');

  // const localText = [
  //   'Welcome To Backyard',
  //   ' ',
  //   'Looking for some documentation to help get started:',
  //   ' https://github.com/elwood-technology/backyard/blob/main/docs/start/quick.md',
  //   'Have questions, ask them here:',
  //   ' https://github.com/elwood-technology/backyard/discussions',
  //   ' ',
  //   uiService && 'UI Service is installed. If you have not setup the Auth ',
  //   uiService &&
  //     'Service yet, you will need to visit the Setup url to get started',
  //   uiService &&
  //     ` Entry: http://${uiService.container?.externalHost}:${uiService.container?.externalPort}/`,
  //   uiService &&
  //     ` Setup: http://${uiService.container?.externalHost}:${uiService.container?.externalPort}/auth/setup`,
  //   uiService && ' ',
  //   'Here is some important information you may need:',
  //   ` Operator Token: ${operatorToken}`,
  //   ` Anonymous Key: ${keys.anonymousKey}`,
  //   ` Service Key: ${keys.serviceKey}`,
  //   ' ',
  //   'Configured Services',
  //   ...getServices(context).map((item) => ` ${item.name} (${item.provider})`),
  // ].filter(Boolean) as string[];

  // await tools.filesystem.writeAsync(localTextFilePath, localText.join(EOL));

  // // we use the local.txt file to determine if the user has run the init command
  // // before we cleared it out. No need to reprint this every time
  // if (!hasLocalText) {
  //   const tbl = new Table({
  //     chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  //     style: { 'padding-left': 2, 'padding-right': 2 },
  //   });

  //   tbl.push([''], ...localText.map((line) => [line]), ['']);

  //   tools.print.info(tbl.toString());
  // }

  spin.succeed();
}

export async function start(tools: Toolbox): Promise<void> {
  const { context } = tools;
  const platform = context.platforms.local;

  if (tools.parameters.options['build'] !== false) {
    await build(tools);
  }

  if (!tools.filesystem.exists(context.dir.stage)) {
    if (
      await tools.prompt.confirm(
        'Looks like you do not have a ".backyard/local" folder.\nWould you like to run "local build"?',
        true,
      )
    ) {
      await build(tools);
    }
  }

  const spin = tools.print.spin();

  try {
    spin.start('Starting...');
    spin.stop();

    await platform.executeHook('start', {
      context,
      commandOptions: tools.parameters.options,
    });

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
    spin.stop();

    await platform.executeHook('stop', {
      context,
      commandOptions: tools.parameters.options,
    });

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

    await platform.executeHook('clean', {
      context,
      commandOptions: tools.parameters.options,
    });

    spin.text = 'Cleaning stage...';
    spin.stop();

    await tools.filesystem.removeAsync(context.dir.stage);

    spin.succeed('Done!');
  } catch (err) {
    spin.fail('Error cleanup');
    tools.print.info(err.message);
    process.exit(1);
  }
}
