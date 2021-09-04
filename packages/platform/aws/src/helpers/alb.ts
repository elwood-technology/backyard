import { AwsRemoteTerraformHookArgs } from '../types';

export function addAlb(args: AwsRemoteTerraformHookArgs): void {
  const { state: _, options } = args;

  if (!options.alb) {
    return;
  }

  const albs = Array.isArray(options.alb) ? options.alb : [options.alb];

  for (const _item of albs) {
  }
}
