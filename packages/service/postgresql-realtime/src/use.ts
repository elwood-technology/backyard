import { ConfigurationService } from '@backyard/types';
import { PostgreSqlRealtimeServiceSettings } from './types';

export function usePostgreSqlRealtimeService(
  config: Omit<
    ConfigurationService<PostgreSqlRealtimeServiceSettings>,
    'provider'
  >,
): ConfigurationService {
  return {
    enabled: true,
    ...config,
    provider: '@backyard/service-postgresql-realtime',
  };
}
