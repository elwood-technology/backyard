import { ContextModeLocal, invariant } from '@backyard/common';

import type {
  ConfigurationService,
  Context,
  JsonObject,
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
      host: context.mode === ContextModeLocal ? config.name : '0.0.0.0',
      imageName: 'supabase/postgres:0.13.0',
      environment: {
        POSTGRES_DB: config.settings?.name ?? 'backyard',
        POSTGRES_USER: config.settings?.user ?? 'postgres',
        POSTGRES_PASSWORD: config.settings?.password ?? 'postgres',
        POSTGRES_PORT: String(config.container?.port ?? 5432),
        PGDATA: '/var/lib/postgresql/data/pgdata',
      },
      volumes: [['', '/var/lib/postgresql/data']],
    },
  };
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

export async function host({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  invariant(service.container?.host, 'Missing db[container.host]');
  return service.container?.host;
}

export async function name({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { name } = service.config?.settings || {};
  invariant(name, 'No name in db settings');
  return name;
}

export async function user({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { user } = service.config?.settings || {};
  invariant(user, 'No user in db settings');
  return user;
}

export async function password({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { password } = service.config?.settings || {};
  invariant(password, 'No password in db settings');
  return password;
}

export async function port({
  service,
}: ServiceHookProviderArgs): Promise<number> {
  invariant(service.container?.port, 'Missing db[container.port]');
  return service.container?.port;
}

export async function awsEcsContainerTaskDef(
  args: ServiceHookProviderArgs,
): Promise<JsonObject> {
  const { parent } = args;

  return {
    ...parent,
    healthCheck: {
      command: [
        'CMD-SHELL',
        'PGPASSWORD=$POSTGRES_PASSWORD pg_isready -d $POSTGRES_DB -U $POSTGRES_USER -p $POSTGRES_PORT',
      ],
      retries: 2,
    },
  };
}
