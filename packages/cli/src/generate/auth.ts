import type { Context } from '@backyard/types';

import {
  DockerComposeService,
  KongService,
  InfrastructureState,
  EcrTaskDefinition,
} from '../types';

const IMAGE_NAME = 'supabase/gotrue:latest';

function envFromContext(context: Context): Record<string, string> {
  const { jwt, operatorToken } = context.config;
  const { auth } = context.coreServiceSettings;

  return {
    GOTRUE_JWT_SECRET: jwt.secret,
    GOTRUE_JWT_EXP: String(jwt.exp),
    GOTRUE_JWT_DEFAULT_GROUP_NAME: jwt.groupName,
    GOTRUE_DB_DRIVER: 'postgres',
    DB_NAMESPACE: 'auth',
    API_EXTERNAL_URL: auth.externalUrl,
    GOTRUE_API_HOST: '0.0.0.0',
    PORT: String(auth.port),
    GOTRUE_SMTP_HOST: auth.smtp.host,
    GOTRUE_SMTP_PORT: String(auth.smtp.port),
    GOTRUE_SMTP_USER: auth.smtp.user,
    GOTRUE_SMTP_PASS: auth.smtp.pass,
    GOTRUE_DISABLE_SIGNUP: `${auth.disableSignUp}`,
    GOTRUE_SITE_URL: 'localhost',
    GOTRUE_MAILER_AUTOCONFIRM: 'true',
    GOTRUE_LOG_LEVEL: 'DEBUG',
    GOTRUE_OPERATOR_TOKEN: operatorToken,
    DATABASE_URL: context.dbUri,
  };
}

export function authDockerCompose(context: Context): DockerComposeService {
  return {
    container_name: 'by-auth',
    image: IMAGE_NAME,
    ports: [
      [
        context.coreServiceSettings.auth.port,
        context.coreServiceSettings.auth.containerPort,
      ].join(':'),
    ],
    depends_on: ['db'],
    environment: envFromContext(context),
  };
}

export function authKongService(state: Context): KongService {
  const { auth } = state.coreServiceSettings;
  return {
    name: 'auth-v1',
    _comment: 'GoTrue: /auth/v1/* -> http://auth:9999/*',
    url: `http://${auth.containerHost}:${auth.containerPort}/`,
    routes: [{ name: 'auth-v1-all', strip_path: true, paths: ['/auth/v1/'] }],
    plugins: [
      { name: 'cors' },
      { name: 'key-auth', config: { hide_credentials: true } },
    ],
  };
}

export function authInfrastructure(
  context: Context,
  state: InfrastructureState,
): EcrTaskDefinition {
  const { auth } = context.coreServiceSettings;
  return {
    cpu: 1024,
    image: IMAGE_NAME,
    memory: 2048,
    name: 'auth',
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
