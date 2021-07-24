import { ContextModeLocal } from '@backyard/common';

import { ConfigurationService, Context, ContextService } from '@backyard/types';

export function config(
  context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  return {
    settings: {
      user: 'postgres',
      password: 'postgres',
      name: 'backyard',
    },
    gateway: {
      enabled: false,
    },
    container: {
      enabled: true,
      port: 5432,
      externalPort: 5432,
      host: context.mode === ContextModeLocal ? 'db' : '0.0.0.0',
      imageName: 'supabase/postgres:0.13.0',
      environment: {
        POSTGRES_DB: config.settings?.name ?? 'backyard',
        POSTGRES_USER: config.settings?.user ?? 'postgres',
        POSTGRES_PASSWORD: config.settings?.password ?? 'postgres',
        POSTGRES_PORT: String(config.container?.port ?? 5432),
      },
    },
  };
}

export async function init(
  context: Context,
  service: ContextService,
): Promise<void> {
  await context.addService({
    name: `${service.name}-migrate`,
    provider: '@backyard/service-postgresql-migrate',
  });
}
