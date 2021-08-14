# Backyard PostgreSQL Migration
Database Setup & Migration Service for Backyard using PostgreSQL

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)


## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgresql-migrate)](https://www.npmjs.com/package/@backyard/service-postgresql-migrate)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { usePostgreSqlService } from '@backyard/service-postgresql-migrate';

export default createWorkspaceConfiguration({
  services: [
    usePostgreSqlService({
      name: 'database-migrate',
      settings: {
        db: string
      }
    }),
  ],
});
```
