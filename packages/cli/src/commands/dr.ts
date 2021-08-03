import { ContextModeLocal, getServices } from '@backyard/common';

import { Toolbox } from '../types';

export const SUB_COMMANDS = ['dump-context'];

export const SUB_COMMANDS_DESC = ['dump the state of the current context'];
export default {
  name: 'dr',
  async run(tools: Toolbox) {
    const subCommand = tools.parameters.first ?? 'help';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    await tools.createContext(ContextModeLocal);

    switch (subCommand) {
      case 'dump-context': {
        tools.print.info(
          JSON.stringify(
            {
              services: getServices(tools.context).map((item) => {
                return {
                  name: item.name,
                  config: item.config,
                  container: item.container,
                  gateway: item.gateway,
                };
              }),
            },
            null,
            3,
          ),
        );
        return;
      }
      default: {
        tools.print.error(`Unknown command "${subCommand}"`);
        tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
        process.exit(1);
      }
    }
  },
};
