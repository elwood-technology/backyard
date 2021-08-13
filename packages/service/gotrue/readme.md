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
![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-gotrue)

## Usage

```typescript
import { createConfiguration } from '@backyard/common';
import { useGoTrueService } from '@backyard/service-gotrue';

export default createConfiguration({
  services: [
    useGoTrueService({
      name: 'auth',
      settings: {
        db: 'db',
        operatorToken: 'a',
      }
    }),

    // GoTrue requires a PostgreSQL database.
    // The database "name" and "settings.db" must match
    {
      name: 'db',
      provider: ['@backyard/service-postgresql'],
      enabled: true,
      settings: {},
    },
  ],
});
```
