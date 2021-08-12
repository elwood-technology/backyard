import { ContextModeRemote } from '@backyard/common';

import { Toolbox } from '../types';

export const SUB_COMMANDS = [
  'build',
  'init',
  'deploy',
  'teardown',
  'clean',
  'help',
];

export const SUB_COMMANDS_DESC = [
  'build the remote stage',
  'alias for `remote build`',
  'deploy the build folder',
  'teardown the remote service',
  'remove all .backyard/build files',
  'this help menu. so meta!',
];

export default {
  name: 'remote',
  alias: ['prod', 'production', 'p', 'r'],
  async run(tools: Toolbox) {
    await tools.createContext(ContextModeRemote);

    const subCommand = tools.parameters.first ?? 'default';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    if (!tools.context.platforms.remote) {
      tools.print.error(`No remote platform provided in configuration`);
      process.exit(1);
    }

    await tools.context.platforms.remote.init();

    switch (subCommand) {
      case 'clean': {
        return await clean(tools);
      }

      case 'init':
      case 'build': {
        return await build(tools);
      }

      case 'teardown': {
        return await teardown(tools);
      }

      case 'deploy': {
        return await deploy(tools);
      }

      default: {
        return await help(tools);
      }
    }
  },
};

export async function clean(tools: Toolbox): Promise<void> {
  const spin = tools.print.spin();
  spin.start('Cleaning...');
  await tools.filesystem.removeAsync(tools.context.dir.stage);
  spin.succeed();
  return;
}

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

export async function build(tools: Toolbox): Promise<void> {
  const spin = tools.print.spin();
  spin.start('Building stage folder...');

  await tools.prepareStage();

  spin.text = 'Sending to remote platform...';

  await tools.context.platforms.remote!.executeHook('build', {
    context: tools.context,
    commandOptions: tools.parameters.options,
  });

  spin.succeed('Build Complete!');
}

export async function deploy(tools: Toolbox): Promise<void> {
  if (tools.parameters.options.build === true) {
    await build(tools);
  }

  await tools.context.platforms.remote!.executeHook('deploy', {
    context: tools.context,
    commandOptions: tools.parameters.options,
  });
}

export async function teardown(tools: Toolbox): Promise<void> {
  const { yes = false, clean = true } = tools.parameters.options;

  if (yes === false) {
    const areYouSure = tools.prompt.confirm(
      'Are you sure you want to teardown the remote instance',
    );

    if (!areYouSure) {
      return;
    }
  }

  await tools.context.platforms.remote!.executeHook('teardown', {
    context: tools.context,
    commandOptions: tools.parameters.options,
  });

  if (clean !== true) {
    await clean(tools);
  }
}
