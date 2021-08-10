import { ContextModeLocal, invariant } from '@backyard/common';
import type { ConfigurationService, Context } from '@backyard/types';

export function config(
  context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  invariant(config.settings?.db, 'Missing settings.db');

  return {
    settings: {
      schema: 'public',
      anonRole: 'anon',
    },
    gateway: {
      enabled: true,
      stripPath: true,
    },
    container: {
      enabled: true,
      imageName: 'postgrest/postgrest:nightly-2021-03-05-19-03-d3a8b5f',
      port: 3000,
      host: context.mode === ContextModeLocal ? config.name : '0.0.0.0',
      environment: {
        PGRST_DB_URI: `<%= await context.getService("${config.settings?.db}").hook("uri") %>`,
        PGRST_DB_SCHEMA: config.settings?.schema ?? 'public',
        PGRST_DB_ANON_ROLE: config.settings?.anonRole ?? 'anon',
        PGRST_JWT_SECRET:
          '<%= await context.getService("gateway").hook("jwtSecret") %>',
      },
      meta: {
        dockerCompose: {
          restart: 'always',
          depends_on: [config.settings.db],
        },
      },
    },
  };
}
