import type { Context } from '@backyard/types';

import {
  InfrastructureState,
  EcrTaskDefinition,
  DockerComposeService,
  KongService,
} from '../types';

const IMAGE_NAME = 'supabase/realtime:latest';

function envFromContext(context: Context): Record<string, string> {
  const { db, realtime } = context.coreServiceSettings;

  return {
    DB_HOST: 'db',
    DB_NAME: db.name,
    DB_USER: db.user,
    DB_PASSWORD: db.password,
    DB_PORT: String(db.containerPort),
    PORT: String(realtime.containerPort),
    HOSTNAME: 'localhost',
    SECURE_CHANNELS: 'false',
    JWT_SECRET: context.config.jwt.secret,
  };
}

export function realtimeDockerCompose(state: Context): DockerComposeService {
  const { realtime } = state.coreServiceSettings;
  const { containerPort, port } = realtime;
  return {
    container_name: 'by-realtime',
    image: IMAGE_NAME,
    ports: [[port, containerPort].join(':')],
    depends_on: ['db'],
    restart: 'on-failure',
    environment: envFromContext(state),
  };
}

export function realtimeKongService(_state: Context): KongService {
  return {
    name: 'realtime-v1',
    _comment: 'Realtime: /realtime/v1/* -> ws://realtime:4000/socket/*',
    url: 'http://realtime:4000/socket/',
    routes: [
      {
        name: 'realtime-v1-all',
        strip_path: true,
        paths: ['/realtime/v1/'],
      },
    ],
    plugins: [
      { name: 'cors' },
      { name: 'key-auth', config: { hide_credentials: true } },
    ],
  };
}

export function realtimeInfrastructure(
  context: Context,
  state: InfrastructureState,
): EcrTaskDefinition {
  const { auth } = context.coreServiceSettings;
  return {
    cpu: 1024,
    image: IMAGE_NAME,
    memory: 2048,
    name: 'realtime',
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': state.region,
        'awslogs-stream-prefix': 'awslogs-by',
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
