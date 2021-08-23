import {
  createWorkspaceConfiguration,
  useEnvValue,
  useOptionalEnvValue,
} from '@backyard/common';
import { JsonObject } from '@backyard/types';
import {
  useAwsRemoteEcsPlatform,
  useAwsRemotePlatform,
} from '@backyard/platform-aws';
import { useGoTrueService } from '@backyard/service-gotrue';
import { useKongService } from '@backyard/service-kong';
import { usePostgreSqlService } from '@backyard/service-postgresql';
import { usePostgreSqlMigrateService } from '@backyard/service-postgresql-migrate';
import { useNextJsService } from '@backyard/service-nextjs';

export default createWorkspaceConfiguration(() => ({
  platform: {
    remote: useAwsRemotePlatform({
      profile: useEnvValue('AWS_PROFILE'),
      region: useEnvValue('AWS_REGION'),
      ecs: {
        clusters: [
          {
            name: 'main',
            cpu: 256,
            memory: 512,
          },
        ],
      },
    }),
  },
  services: [
    // GATEWAY
    // https://backyard.io/docs/services/kong
    useKongService({
      name: 'gateway',
      settings: {
        routePrefix: 'api/',
        jwt: {
          secret: useEnvValue('JWT_SECRET'),
          iat: useOptionalEnvValue('JWT_IAT'),
        },
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.2,
          containerMemory: 0.2,
        }),
      },
    }),

    // DATABASE
    // https://backyard.io/docs/services/postgresql
    usePostgreSqlService({
      name: 'db',
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.39,
          containerMemory: 0.39,
        }),
      },
    }),

    // WEB
    // https://backyard.io/docs/services/nextjs
    useNextJsService({
      name: 'web',
      settings: {
        src: './src/web',
      },
      container: {
        environment: {
          NEXT_PUBLIC_AUTH_URL:
            '<%= context.getService("auth").getGatewayUrl() %>',
          NEXT_PUBLIC_WEB_URL:
            '<%= context.getService("web").getGatewayUrl() %>',
          NEXT_PUBLIC_ANONYMOUS_KEY:
            '<%= await context.getService("gateway").hook("anonymousKey") %>',
        },
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.2,
          containerMemory: 0.2,
        }),
      },
    }),

    // AUTH
    // https://backyard.io/docs/services/gotrue
    useGoTrueService({
      name: 'auth',
      settings: {
        operatorToken: useEnvValue('OPERATOR_TOKEN'),
        db: 'db',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.2,
          containerMemory: 0.2,
        }),
      },
    }),

    // DATABASE MIGRATE
    // https://backyard.io/docs/services/postgresql-migrate
    usePostgreSqlMigrateService({
      name: 'db-migrate',
      settings: {
        db: 'db',
      },

      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.01,
          containerMemory: 0.01,
        }),
      },
    }),
  ],
}));

export function createAppAttributes(): JsonObject[] {
  return [
    {
      prompt: 'AWS Profile',
      env: 'AWS_PROFILE',
    },
    {
      prompt: 'AWS Region',
      env: 'AWS_REGION',
    },
    {
      env: 'JWT_SECRET',
      autofill: { random: 32 },
    },
    {
      env: 'OPERATOR_TOKEN',
      autofill: { random: 55 },
    },
  ];
}
