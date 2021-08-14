# Backyard PostgREST
Rest Service for Backyard using PostgREST


## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)

## What is PostgREST

 - [Docs](https://postgrest.org/en/stable/index.html)
 - [Repo](https://github.com/PostgREST/postgrest)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgrest)](https://www.npmjs.com/package/@backyard/service-postgrest)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { usePostgRestService } from '@backyard/service-postgrest';

export default createWorkspaceConfiguration({
  services: [
    usePostgRestService({
      name: 'rest',
      settings: {
        db: string,
        schema: string,
        anonRole: string
      }
    }),
  ],
});
```
