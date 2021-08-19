# Backyard PostgreSQL Realtime
Listen to PostgreSQL changes over websocket for Backyard using Supabase Realtime

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)


## What is Supabase Realtime
Listens to changes in a PostgreSQL Database and broadcasts them over websockets.

 - [Repo](https://github.com/supabase/realtime)
 - [Homepage](https://supabase.io/)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/@backyard/service-postgresql-realtime)](https://www.npmjs.com/package/@backyard/@backyard/service-postgresql-realtime)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { usePostgreSqlRealtimeService } from '@backyard/@backyard/service-postgresql-realtime';

export default createWorkspaceConfiguration({
  services: [
    usePostgreSqlRealtimeService({
      name: 'realtime',
      settings: {
        db: string
      }
    }),
  ],
});
```
