# Backyard GoTrue
Authentication Service for Backyard powered by GoTrue

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)

## What is GoTrue

 - [Docs](https://github.com/netlify/gotrue#readme)
 - [Repo](https://github.com/netlify/gotrue)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-gotrue)](https://www.npmjs.com/package/@backyard/service-gotrue)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { usePostgreSqlService } from '@backyard/service-postgresql';
import { useGoTrueService } from '@backyard/service-gotrue';

export default createWorkspaceConfiguration({
  services: [
    useGoTrueService({
      name: 'auth',
      settings: {
        db: 'auth-database',
        operatorToken: 'a',
      }
    }),

    // GoTrue requires a PostgreSQL database.
    // The database "name" and "settings.db" must match
    usePostgreSqlService({
      name: 'auth-database',
    }),
  ],
});
```
