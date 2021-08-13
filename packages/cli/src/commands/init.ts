import { ContextModeLocal } from '@backyard/common';

import { Toolbox } from '../types';
import { build } from './local';

export default {
  name: 'init',
  alias: 'i',
  async run(tools: Toolbox) {
    await tools.createContext(ContextModeLocal);

    const { context, filesystem } = tools;
    const { local = true } = tools.parameters.options || {};

    await filesystem.dirAsync(context.dir.backyard);

    if (local !== false) {
      await build(tools);
    }
  },
};
