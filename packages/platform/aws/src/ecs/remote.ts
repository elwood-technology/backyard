import type { ServiceHookProviderArgs } from '@backyard/types';

import type { AwsRemoteTerraformHookArgs } from '../types';
import { addGatewayEcs } from './gateway';

export async function aws(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<void> {
  const { context, service } = args;

  if (service.name === 'gateway') {
    return addGatewayEcs(context, args);
  }

  return;
}

export { awsEcsContainerTaskDef } from './container';
