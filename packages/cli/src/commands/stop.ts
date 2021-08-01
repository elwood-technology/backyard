import { Toolbox } from '../types';
import { default as local } from './local';

export default {
  name: 'stop',
  async run(tools: Toolbox) {
    tools.parameters.first = 'stop';
    await local.run(tools);
  },
};
