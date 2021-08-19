import type { ConfigurationModule } from '@backyard/types';

import type { AwsRemoteOptions } from './types';
import type { AwsRemoteEcsOptions } from './ecs/types';
import type { AwsRemoteLambdaOptions } from './lambda/types';

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

export function useAwsRemoteLambdaPlatform(
  options: AwsRemoteLambdaOptions = {},
): ConfigurationModule {
  return ['@backyard/platform-aws/lambda', options];
}
