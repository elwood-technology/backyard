import { Toolbox } from '../types';
import { default as local } from './local';

export default {
  name: 'start',

  async run(tools: Toolbox) {
    tools.parameters.first = 'start';
    await local.run(tools);
  },
};
