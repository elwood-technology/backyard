import { createConfiguration } from '@backyard/common';
import { JsonObject } from '@backyard/types';
import {
  useAwsRemoteEcsPlatform,
  useAwsRemotePlatform,
} from '@backyard/platform-aws';
import { useGoTrueService } from '@backyard/service-gotrue';

export default createConfiguration({
  platform: {
    remote: useAwsRemotePlatform({
      profile: String(process.env.AWS_PROFILE),
      region: String(process.env.AWS_REGION),
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
    {
      name: 'gateway',
      settings: {
        jwt: {
          secret: process.env.JWT_SECRET,
          iat: process.env.JWT_IAT,
        },
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
        }),
      },
    },
    useGoTrueService({
      name: 'auth',
      settings: {
        operatorToken: String(process.env.OPERATOR_TOKEN),
        db: 'database',
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.25,
          containerMemory: 0.25,
        }),
      },
    }),
  ],
});

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
      autofill: { default: '' },
    },
    {
      prompt: 'Operator Token',
      env: 'OPERATOR_TOKEN',
      autofill: { random: 55 },
    },
  ];
}
