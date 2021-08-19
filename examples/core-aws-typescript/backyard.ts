import { createWorkspaceConfiguration, useEnvValue } from '@backyard/common';
import { JsonObject } from '@backyard/types';
import {
  useAwsRemoteEcsPlatform,
  useAwsRemotePlatform,
} from '@backyard/platform-aws';
import { useGoTrueService } from '@backyard/service-gotrue';
import { useKongService } from '@backyard/service-kong';
import { usePostgRestService } from '@backyard/service-postgrest';
import { usePostgreSqlService } from '@backyard/service-postgresql';
import { usePostgreSqlRealtimeService } from '@backyard/service-postgresql-realtime';
import { useNextJsService } from '@backyard/service-nextjs';

export default createWorkspaceConfiguration(() => ({
  platform: {
    remote: useAwsRemotePlatform({
      profile: process.env.AWS_PROFILE!,
      region: process.env.AWS_REGION!,
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
        jwt: {
          secret: process.env.JWT_SECRET!,
          iat: Number(process.env.JWT_IAT),
        },
      },
      container: {
        externalPort: 8000,
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
          containerCpu: 0.24,
          containerMemory: 0.24,
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
        externalPort: 8080,
        environment: {
          NEXT_PUBLIC_AUTH_URL:
            '<%= context.getService("auth").getGatewayUrl() %>',
          NEXT_PUBLIC_REALTIME_URL:
            '<%= context.getService("realtime").getGatewayUrl() %>',
          NEXT_PUBLIC_REST_URL:
            '<%= context.getService("rest").getGatewayUrl() %>',
          NEXT_PUBLIC_WEB_URL:
            '<%= context.getService("web").getGatewayUrl() %>',
          NEXT_PUBLIC_ANONYMOUS_KEY:
            '<%= await context.getService("gateway").hook("anonymousKey") %>',
        },
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.15,
          containerMemory: 0.15,
        }),
      },
    }),

    // AUTH
    // https://backyard.io/docs/services/gotrue
    useGoTrueService({
      name: 'auth',
      settings: {
        operatorToken: process.env.OPERATOR_TOKEN!,
        db: 'db',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.15,
          containerMemory: 0.15,
        }),
      },
    }),

    // REST
    // https://backyard.io/docs/services/postgrest
    usePostgRestService({
      name: 'rest',
      settings: {
        db: 'db',
        schema: 'public',
        anonRole: 'anon',
      },
      container: {
        externalPort: 4000,
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.15,
          containerMemory: 0.15,
        }),
      },
    }),

    // REALTIME
    // httsps://backyard.io/docs/services/postgresql-realtime
    usePostgreSqlRealtimeService({
      name: 'realtime',
      settings: {
        db: 'db',
      },
      container: {
        externalPort: 4001,
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.1,
          containerMemory: 0.1,
        }),
      },
    }),

    // MIGRATE
    // https://backyard.io/docs/services/postgresql-migrate
    {
      name: 'db-migrate',
      provider: '@backyard/service-postgresql-realtime',
      settings: {
        db: 'db',
      },
      container: {
        externalPort: 4002,
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.01,
          containerMemory: 0.01,
        }),
      },
    },
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
      prompt: 'JWT Secret',
      env: 'JWT_SECRET',
      autofill: { random: 32 },
    },
    {
      env: 'JWT_IAT',
      autofill: { default: Math.floor(Date.now() / 1000) },
    },
    {
      env: 'OPERATOR_TOKEN',
      autofill: { random: 55 },
    },
  ];
}
