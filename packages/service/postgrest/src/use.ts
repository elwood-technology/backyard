import { ConfigurationService } from '@backyard/types';
import { PostgRestServiceSettings } from './types';

export function usePostgRestService(
  config: Omit<ConfigurationService<PostgRestServiceSettings>, 'provider'>,
): ConfigurationService {
  return {
    enabled: true,
    ...config,
    provider: '@backyard/service-postgrest',
  };
}
