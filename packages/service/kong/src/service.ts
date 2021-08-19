import { join } from 'path';

import { stringify as yaml } from 'yaml';

import {
  ConfigurationService,
  Context,
  ServiceHookProviderArgs,
} from '@backyard/types';
import { ContextModeRemote, invariant } from '@backyard/common';

import { createKongConfig } from './config';

import { generateKeys } from './keys';
import { KongContextService, KongKeys, KongServiceSettings } from './types';

export const defaultIat = 384584607;

export const kongPlugins = [
  'request-transformer',
  'cors',
  'key-auth',
  'http-log',
  'request-termination',
  'aws-lambda',
].join(',');

export function config(
  context: Context,
  config: ConfigurationService<KongServiceSettings>,
): Partial<ConfigurationService> {
  invariant(
    config.settings?.jwt.secret,
    `Must provide ${config.name}.settings.jwt.secret`,
  );

  console.log('poop');

  return {
    settings: {
      jwt: {
        iat: defaultIat,
        groupName: 'backyard',
        exp: defaultIat + 60 * 60 * 24 * 365 * 50,
      },
    },
    gateway: {
      enabled: false,
    },
    container: {
      enabled: true,
      port: 8000,
      host: context.mode === ContextModeRemote ? '0.0.0.0' : 'gateway',
      externalPort: context.mode === ContextModeRemote ? 80 : 8000,
      volumes: [['', '/var/lib/kong/']],
      environment: {
        KONG_DECLARATIVE_CONFIG: '/var/lib/kong/config.yml',
        KONG_PLUGINS: kongPlugins,
      },
      build: {
        context: './gateway',
      },
    },
  };
}

export async function stage(
  args: ServiceHookProviderArgs<KongContextService> & { dir: string },
): Promise<void> {
  const { dir, context, service } = args;
  const { filesystem } = context.tools;

  await filesystem.writeAsync(
    join(dir, 'config.yml'),
    yaml(await createKongConfig(context, service)),
  );

  await filesystem.writeAsync(
    join(dir, 'Dockerfile'),
    `FROM kong:2.1

COPY config.yml /var/lib/kong/config.yml

# Build time defaults
ARG build_KONG_DATABASE=off
ARG build_KONG_PLUGINS=${kongPlugins}
ARG build_KONG_DECLARATIVE_CONFIG=/var/lib/kong/config.yml

# Run time values
ENV KONG_DATABASE=$build_KONG_DATABASE
ENV KONG_PLUGINS=$build_KONG_PLUGINS
ENV KONG_DECLARATIVE_CONFIG=$build_KONG_DECLARATIVE_CONFIG

EXPOSE 8000`,
  );
}

export async function keys({
  service,
}: ServiceHookProviderArgs): Promise<KongKeys> {
  console.log(service.config);

  return generateKeys(
    service.config as ConfigurationService<KongServiceSettings>,
  );
}

export async function anonymousKey(
  args: ServiceHookProviderArgs,
): Promise<string> {
  return (await keys(args)).anonymousKey;
}

export async function serviceKey(
  args: ServiceHookProviderArgs,
): Promise<string> {
  return (await keys(args)).serviceKey;
}

export async function jwtSecret({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { secret } = service.config?.settings?.jwt || {};
  invariant(secret, 'No JWT Secret in Kong');
  return secret;
}

export async function jwtExp({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { exp } = service.config?.settings?.jwt || {};
  invariant(exp, 'No JWT exp in Kong');
  return exp;
}

export async function jwtIat({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { iat } = service.config?.settings?.jwt || {};
  invariant(iat, 'No JWT iat in Kong');
  return iat;
}

export async function jwtGroup({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { groupName } = service.config?.settings?.jwt || {};
  invariant(groupName, 'No JWT groupName in Kong');
  return groupName;
}
