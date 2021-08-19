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
    // https://backyard.io/docs/services/gateway
    useKongService({
      name: 'gateway',
      settings: {
        jwt: {
          secret: useEnvValue('JWT_SECRET'),
        },
        anonymousKey: '',
        serviceKey: '',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
        }),
      },
    }),

    // AUTH
    // https://backyard.io/docs/services/auth
    useGoTrueService({
      name: 'auth',
      settings: {
        operatorToken: useEnvValue('OPERATOR_TOKEN'),
        db: 'db',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
        }),
      },
    }),

    // REST
    // https://backyard.io/docs/services/rest
    usePostgRestService({
      name: 'rest',
      settings: {
        db: 'db',
        schema: 'public',
        anonRole: 'anon',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
        }),
      },
    }),

    // DATABASE
    // https://backyard.io/docs/services/database
    usePostgreSqlService({
      name: 'db',
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
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
