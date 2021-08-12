import { ConfigurationModule } from '@backyard/types';

import { AwsRemotePlatform } from './remote';

import type { AwsRemoteOptions } from './types';
import type { AwsRemoteEcsOptions } from './ecs/types';

export const remote = new AwsRemotePlatform();

export function useAwsRemotePlatform(
  options: AwsRemoteOptions,
): ConfigurationModule<AwsRemoteOptions> {
  return ['@backyard/platform-aws', options];
}

export function useAwsRemoteEcsPlatform(
  options: AwsRemoteEcsOptions,
): ConfigurationModule<AwsRemoteEcsOptions> {
  return ['@backyard/platform-aws/ecs', options];
}

export * from './types';
export * from './ecs/types';
