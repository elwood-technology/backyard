import type { Context } from '@backyard/types';
import { join } from 'path';

import {
  DockerComposeService,
  InfrastructureState,
  KongConfig,
  EcrTaskDefinition,
  KongService,
} from '../types';
import { authKongService } from './auth';
import { realtimeKongService } from './realtime';
import { restKongService } from './rest';
import { storageKongService } from './storage';

export const kongPlugins = [
  'request-transformer',
  'cors',
  'key-auth',
  'http-log',
  'request-termination',
].join(',');

export type KongServiceArgs = {
  name: string;
  version?: number;
  comment?: string;
  url?: string;
  plugins?: KongService['plugins'];
};

export function kongService(args: KongServiceArgs): KongService {
  const { url } = args;
  const version = args.version || 1;
  const name = `${args.name}-v${version}`;
  const comment = args.comment || args.name;

  return {
    name,
    _comment: comment,
    url,
    routes: [
      {
        name: `${name}-all`,
        strip_path: false,
        paths: [`/${args.name}/v${version}/`],
      },
    ],
    plugins: [
      ...(args.plugins || []),
      { name: 'cors' },
      { name: 'key-auth', config: { hide_credentials: true } },
    ],
  };
}

export function kongDockerCompose(state: Context): DockerComposeService {
  const { kong } = state.coreServiceSettings;
  const { port = 8000, tlsPort = 8443, containerPort } = kong;

  return {
    container_name: 'by-kong',
    build: { context: './kong' },
    environment: {
      KONG_DECLARATIVE_CONFIG: '/var/lib/kong/config.yml',
      KONG_PLUGINS: kongPlugins,
    },
    ports: [`${port}:${containerPort}/tcp`, `${tlsPort}:8443/tcp`],
    volumes: [`${state.dir.dest}/kong:/var/lib/kong/`],
  };
}

export function kongDockerfile(context: Context): string {
  return `FROM kong:2.1

COPY config.yml /var/lib/kong/config.yml

# Build time defaults
ARG build_KONG_DATABASE=off
ARG build_KONG_PLUGINS=${kongPlugins}
ARG build_KONG_DECLARATIVE_CONFIG=/var/lib/kong/config.yml

# Run time values
ENV KONG_DATABASE=$build_KONG_DATABASE
ENV KONG_PLUGINS=$build_KONG_PLUGINS
ENV KONG_DECLARATIVE_CONFIG=$build_KONG_DECLARATIVE_CONFIG

EXPOSE ${context.coreServiceSettings.kong.containerPort}`;
}

export function kongConfig(
  state: Context,
  services: KongService[],
): KongConfig {
  return {
    _format_version: '1.1',
    services: [
      authKongService(state),
      restKongService(state),
      realtimeKongService(state),
      storageKongService(state),
      ...services,
      {
        name: 'health',
        _comment: 'Health',
        url: 'http://0.0.0.0:8000/',
        routes: [{ name: 'health-all', strip_path: true, paths: ['/health'] }],
        plugins: [
          {
            name: 'request-termination',
            config: {
              status_code: 200,
              message: 'hello :)',
            },
          },
        ],
      },
    ],
    consumers: [
      {
        username: 'anon-key',
        keyauth_credentials: [
          {
            key: state.keys.anon,
          },
        ],
      },
      {
        username: 'service-key',
        keyauth_credentials: [
          {
            key: state.keys.service,
          },
        ],
      },
    ],
  };
}

export function kongInfrastructure(
  context: Context,
  state: InfrastructureState,
): EcrTaskDefinition {
  const ecr = state.tf.resource('aws_ecr_repository', 'backyard--kong-ecr', {
    name: 'backyard_kong',
    image_tag_mutability: 'MUTABLE',
  });

  const img = state.tf.module('kong_ecr_image', {
    source: 'github.com/backyardjs/terraform-aws-ecr-image',
    dockerfile_dir: join(context.dir.dest, 'kong'),
    ecr_repository_url: ecr.attr('repository_url'),
    aws_profile: state.profile,
    aws_region: state.region,
  });

  return {
    cpu: 1024,
    image: img.attr('ecr_image_url').toString(),
    memory: 2048,
    name: 'kong',
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': state.region,
        'awslogs-stream-prefix': 'kong',
      },
    },
    environment: [
      {
        name: 'KONG_DECLARATIVE_CONFIG',
        value: '/var/lib/kong/config.yml',
      },
      {
        name: 'KONG_PLUGINS',
        value: kongPlugins,
      },
    ],
    portMappings: [
      {
        containerPort: context.coreServiceSettings.kong.containerPort,
        hostPort: context.coreServiceSettings.kong.containerPort,
      },
    ],
  };
}
