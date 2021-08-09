import { ContextModeLocal, invariant } from '@backyard/common';

import type {
  ConfigurationService,
  Context,
  ServiceHookProviderArgs,
} from '@backyard/types';

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

export async function init({
  context,
  service,
}: ServiceHookProviderArgs): Promise<void> {
  await context.addService({
    name: `${service.name}-migrate`,
    provider: '@backyard/service-postgresql-migrate',
    settings: {
      db: service.name,
    },
  });
}

export async function uri({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { user, password, name } = service.config?.settings || {};

  invariant(user, 'No user in db settings');
  invariant(password, 'No password in db settings');
  invariant(name, 'No name in db settings');
  invariant(service.container?.host, 'Missing db[container.host]');
  invariant(service.container.port, 'Missing db[container.port]');

  return `postgres://${user}:${password}@${service.container.host}:${service.container.port}/${name}?sslmode=disable`;
}
