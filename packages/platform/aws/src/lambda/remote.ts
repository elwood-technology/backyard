import type { ServiceHookProviderArgs } from '@backyard/types';

import type { AwsRemoteTerraformHookArgs } from '../types';

export async function aws(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<void> {
  console.log(args.options);

  return;
}
