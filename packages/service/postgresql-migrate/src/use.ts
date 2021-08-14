import { ConfigurationService } from '@backyard/types';
import { PostgreSqlMigrateServiceSettings } from './types';

export function usePostgreSqlService(
  config: Omit<
    ConfigurationService<PostgreSqlMigrateServiceSettings>,
    'provider'
  >,
): ConfigurationService {
  return {
    enabled: true,
    ...config,
    provider: '@backyard/service-postgresql-migrate',
  };
}
