import { Toolbox } from '../types';
import { default as local } from './local';

export default {
  name: 'restart',
  async run(tools: Toolbox) {
    tools.parameters.first = 'restart';
    await local.run(tools);
  },
};
