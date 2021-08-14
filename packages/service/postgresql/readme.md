# Backyard PostgreSQL
Database Service for Backyard powered by PostgreSQL

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)

## What is GoTrue

 - [Docs](https://www.postgresql.org/docs/13/index.html)
 - [Repo](https://git.postgresql.org/gitweb/?p=postgresql.git)
 - [Website](https://www.postgresql.org/)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgresql)](https://www.npmjs.com/package/@backyard/service-postgresql)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { usePostgreSqlService } from '@backyard/service-postgresql';

export default createWorkspaceConfiguration({
  services: [
    usePostgreSqlService({
      name: 'database',
      settings: {
        name: string,
        user: string,
        password: string,
      }
    }),
  ],
});
```
