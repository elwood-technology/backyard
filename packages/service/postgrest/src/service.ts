import { ContextModeLocal } from '@backyard/common';
import type { ConfigurationService, Context } from '@backyard/types';

export function config(
  context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  return {
    settings: {
      schema: 'public',
      anonRole: 'anon',
    },
    gateway: {
      enabled: true,
      name: 'rest',
      stripPath: true,
    },
    container: {
      enabled: true,
      imageName: 'postgrest/postgrest:latest',
      port: 3000,
      externalPort: 4000,
      host: context.mode === ContextModeLocal ? 'rest' : '0.0.0.0',
      environment: {
        PGRST_DB_URI: '<%= await context.getService("db").hook("uri") %>',
        PGRST_DB_SCHEMA: config.settings?.schema ?? 'public',
        PGRST_DB_ANON_ROLE: config.settings?.anonRole ?? 'anon',
        PGRST_JWT_SECRET:
          '<%= await context.getService("gateway").hook("jwtSecret") %>',
      },
      meta: {
        dockerCompose: {
          depends_on: ['db'],
        },
      },
    },
  };
}
