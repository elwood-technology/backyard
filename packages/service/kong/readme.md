# Backyard Kong
Gateway Service for Backyard powered by Kong

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)

## What is GoTrue

 - [Docs](https://docs.konghq.com/gateway-oss/)
 - [Repo](https://github.com/Kong/kong)
 - [Website](https://konghq.com/)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-kong)](https://www.npmjs.com/package/@backyard/service-kong)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { useKongService } from '@backyard/service-kong';

export default createWorkspaceConfiguration({
  services: [
    useKongService({
      name: 'gateway',
      settings: {
        jwt: {
          iat: number,
          secret: string,
          groupName: string,
          exp: number
        }
      }
    }),
  ],
});
```
