import { ConfigurationService } from '@backyard/types';
import { KongServiceSettings } from './types';

export function useKongService(
  config: Omit<ConfigurationService<KongServiceSettings>, 'provider'>,
): ConfigurationService {
  return { enabled: true, ...config, provider: '@backyard/service-kong' };
}
