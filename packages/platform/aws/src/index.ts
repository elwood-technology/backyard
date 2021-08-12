import { ConfigurationModule } from '@backyard/types';
import { AwsRemoteOptions } from './types';

import { AwsRemotePlatform } from './remote';

export const remote = new AwsRemotePlatform();

export function useAwsRemotePlatform(
  options: AwsRemoteOptions,
): ConfigurationModule<AwsRemoteOptions> {
  return ['@backyard/platform-aws', options];
}

export * from './types';
