import { ConfigurationService } from '@backyard/types';
import { GoTrueServiceSettings } from './types';

export * from './types';

export function useGoTrueService(
  config: Omit<ConfigurationService<GoTrueServiceSettings>, 'provider'>,
): ConfigurationService {
  return { enabled: true, ...config, provider: '@backyard/service-gotrue' };
}
