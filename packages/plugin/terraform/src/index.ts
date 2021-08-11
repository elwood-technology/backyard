import { TerraformGenerator } from 'terraform-generator';

export * as remote from './remote';
export * from './hook';
export * from './types';

export default {
  async createGenerator(): Promise<TerraformGenerator> {
    return new TerraformGenerator();
  },
};

export { Function, Argument, Map, Heredoc } from 'terraform-generator';
