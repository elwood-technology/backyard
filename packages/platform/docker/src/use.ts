import type { ConfigurationModule } from '@backyard/types';

import { DockerLocalPlatformOptions } from './types';

export function useDockerLocalPlatform(
  options: DockerLocalPlatformOptions = {},
): ConfigurationModule<DockerLocalPlatformOptions> {
  return ['@backyard/platform-docker', options];
}
