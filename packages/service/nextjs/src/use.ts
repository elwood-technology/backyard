import { ConfigurationService } from '@backyard/types';
import { NextJsServiceSettings } from './types';

export function useNextJsService(
  config: Omit<ConfigurationService<NextJsServiceSettings>, 'provider'>,
): ConfigurationService {
  return { enabled: true, ...config, provider: '@backyard/service-nextjs' };
}
