import type { Context } from '@backyard/types';

import {
  InfrastructureState,
  EcrTaskDefinition,
  DockerComposeService,
  KongService,
} from '../types';

const IMAGE_NAME = 'postgrest/postgrest:latest';

function envFromContext(context: Context): Record<string, string> {
  return {
    PGRST_DB_URI: context.dbUri,
    PGRST_DB_SCHEMA: 'public',
    PGRST_DB_ANON_ROLE: 'anon',
    PGRST_JWT_SECRET: context.config.jwt.secret,
  };
}

export function restDockerCompose(state: Context): DockerComposeService {
  const { rest } = state.coreServiceSettings;

  return {
    container_name: 'by-rest',
    image: IMAGE_NAME,
    ports: [[rest.port, rest.containerPort].join(':')],
    depends_on: ['db'],
    restart: 'always',
    environment: envFromContext(state),
  };
}

export function restKongService(_state: Context): KongService {
  return {
    name: 'rest-v1',
    _comment: 'PostgREST: /rest/v1/* -> http://rest:3000/*',
    url: 'http://rest:3000/',
    routes: [{ name: 'rest-v1-all', strip_path: true, paths: ['/rest/v1/'] }],
    plugins: [
      { name: 'cors' },
      { name: 'key-auth', config: { hide_credentials: true } },
    ],
  };
}

export function restInfrastructure(
  context: Context,
  state: InfrastructureState,
): EcrTaskDefinition {
  const { auth } = context.coreServiceSettings;
  return {
    cpu: 1024,
    image: IMAGE_NAME,
    memory: 2048,
    name: 'rest',
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': state.region,
        'awslogs-stream-prefix': 'rest',
      },
    },
    environment: Object.entries(envFromContext(context)).map(
      ([name, value]) => {
        return {
          name,
          value,
        };
      },
    ),

    portMappings: [
      {
        containerPort: auth.containerPort,
        hostPort: auth.port,
      },
    ],
  };
}
