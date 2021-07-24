import { join } from 'path';

import { stringify as yaml } from 'yaml';

import { ConfigurationService, Context } from '@backyard/types';

import { createKongConfig } from './config';
import { ContextModeRemote } from 'packages/common/src/constants';

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
  _config: ConfigurationService,
): Partial<ConfigurationService> {
  return {
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

export async function stage(dir: string, context: Context): Promise<void> {
  const { filesystem } = context.tools;

  await filesystem.writeAsync(
    join(dir, 'config.yml'),
    yaml(await createKongConfig(context)),
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
