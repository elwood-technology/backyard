import { Function, Argument, Map, Heredoc } from 'terraform-generator';

import type { JsonObject } from '@backyard/types';

import { TerraformHookArgs } from './types';

export function createTerraformHookArgs<
  Args extends TerraformHookArgs = TerraformHookArgs,
>(args: Pick<TerraformHookArgs, 'tf'> & JsonObject): Args {
  return {
    ...args,
    Function,
    Argument,
    Map,
    Heredoc,
  } as Args;
}
