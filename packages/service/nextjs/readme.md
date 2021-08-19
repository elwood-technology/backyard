# Backyard Next.js
React Framework for Backyard powered by Next.js

## What is Backyard
Backyard is an opinioned microservices platform

 - [Docs](https://backyard.io/docs)
 - [Repo](https://github.com/elwood-technology/backyard)
 - [Homepage](https://backyard.io)

## What is Next.js

 - [Docs](https://nextjs.org/docs)
 - [Repo](https://github.com/vercel/next.js)
 - [Website](https://nextjs.org/)

## Install
[![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-nextjs)](https://www.npmjs.com/package/@backyard/service-nextjs)

## Usage

```typescript
import { createWorkspaceConfiguration } from '@backyard/common';
import { useNextJsService } from '@backyard/service-nextjs';

export default createWorkspaceConfiguration({
  services: [
    useNextJsService({
      name: 'web',
      settings: {
        src: string
      }
    }),
  ],
});
```
