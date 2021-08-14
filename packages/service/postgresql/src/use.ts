import { ConfigurationService } from '@backyard/types';
import { PostgreSqlServiceSettings } from './types';

export function usePostgreSqlService(
  config: Omit<ConfigurationService<PostgreSqlServiceSettings>, 'provider'>,
): ConfigurationService {
  return { enabled: true, ...config, provider: '@backyard/service-postgresql' };
}
