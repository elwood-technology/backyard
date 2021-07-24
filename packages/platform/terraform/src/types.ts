import {
  TerraformGenerator,
  Function,
  Argument,
  Map,
  Heredoc,
} from 'terraform-generator';

import { ServiceHookProviderArgs } from '@backyard/types';

export interface TerraformHookArgs extends ServiceHookProviderArgs {
  tf: TerraformGenerator;
  Function: typeof Function;
  Argument: typeof Argument;
  Map: typeof Map;
  Heredoc: typeof Heredoc;
}

export type { TerraformGenerator, Resource } from 'terraform-generator';
