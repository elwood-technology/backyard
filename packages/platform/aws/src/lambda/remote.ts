import type { ServiceHookProviderArgs } from '@backyard/types';

import type { AwsRemoteTerraformHookArgs } from '../types';

export async function aws(
  _args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<void> {
  return;
}
