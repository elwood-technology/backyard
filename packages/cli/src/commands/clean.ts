import { ContextModeLocal } from '@backyard/common';
import { filesystem } from 'gluegun';
import { Toolbox } from '../types';

export default {
  name: 'clean',
  async run(tools: Toolbox) {
    await tools.createContext(ContextModeLocal);

    if (!tools.filesystem.exists(tools.context.dir.backyard)) {
      tools.print.info('No .backyard folder to clean');
      return;
    }

    const { force = false, yes = false } = tools.parameters.options || {};

    if (filesystem.exists(tools.context.dir.state)) {
      const stateFilesOrFolder = tools.filesystem.find(
        tools.context.dir.state,
        {
          matching: '*',
        },
      );

      if (stateFilesOrFolder.length > 0 && force !== true) {
        tools.print.divider();
        tools.print.newline();
        tools.print.error(
          ' Unable to clean .backyard because there are one or more .state files',
        );
        tools.print.error(
          ' Run with --force or remove these files an run again:',
        );
        tools.print.newline();
        tools.print.table([
          ...stateFilesOrFolder.map((file) => {
            return [file];
          }),
        ]);
        tools.print.newline();
        tools.print.divider();
        return;
      }
    }

    if (yes === false) {
      const shouldClean = await tools.prompt.confirm(
        'Are you sure you want to remove the .backyard folder?',
      );

      if (!shouldClean) {
        return;
      }
    }

    await tools.filesystem.removeAsync(tools.context.dir.backyard);
  },
};
