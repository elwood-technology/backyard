# AWS Platform for Backyard
Use AWS as your Backyard Remote Platform


## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)


## Supported AWS Services

 - ECS
 - Lambda

## Install
![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-aws)

## Usage
This platform can be used as both your Workspace Remote Platform and a Service Remote Platform. _Note:_ This platform can not be used locally

```javascript
{
  platform: {
    remote: ["@backyard/platform-aws", AwsRemoteOptions]
  },
  services: [
    {
      name: "db",
      provider: "@backyard/service-postgresql",
      platform: {
        remote: ["@backyard/platform-aws/ecs", AwsRemoteEcsOptions]
      }
    }
  ]
}
```

### Workspace Remote Platform
```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { useAwsRemotePlatform } from '@backyard/platform-aws';

export default createWorkspaceConfiguration({
  platform: {
    remote: useAwsRemotePlatform({
      profile: 'elwood',
      region: 'us-west-1',
      vpc: {
        name: 'backyard',
        subnetCount: 2,
      },
      ecs: {
        clusters: [
          {
            name: 'main',
            cpu: 512,
            memory: 1024,
          },
        ],
      },
    }),
  },
});
```

### Service Remote Platform
```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { useAwsRemoteEcsPlatform, useAwsRemotePlatform } from '@backyard/platform-aws';

export default createWorkspaceConfiguration({
  platform: {
    remote: useAwsRemotePlatform({
      profile: 'elwood',
      region: 'us-west-1',
      vpc: {
        name: 'backyard',
        subnetCount: 2,
      },
      ecs: {
        clusters: [
          {
            name: 'main',
            cpu: 512,
            memory: 1024,
          },
        ],
      },
    }),
  },
  services: [
    {
      name: 'gateway',
      enabled: true,
      settings: {
        jwt: {
          secret: '<secret>',
          iat: 1624047323,
        },
      },
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.5,
          containerMemory: 0.5,
        }),
      },
    },
    {
      name: 'db',
      provider: ['@backyard/service-postgresql'],
      platform: {
        remote: useAwsRemoteEcsPlatform({
          cluster: 'main',
          containerCpu: 0.5,
          containerMemory: 0.5,
        }),
      },
    },
  ]
});
```
