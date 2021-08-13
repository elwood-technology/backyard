# Architecture

- [Architecture](#architecture)
  - [Folder Structure](#folder-structure)
    - [Files](#files)
      - [Package Example](#package-example)
      - [Typescript Configuration Example](#typescript-configuration-example)
      - [ReadMe Example](#readme-example)
  - [Packages](#packages)
    - [`cli` (@backyard/cli)](#cli-backyardcli)
    - [`common` (@backyard/common)](#common-backyardcommon)
    - [`context` (@backyard/context)](#context-backyardcontext)
    - [Platforms (`platforms/`)](#platforms-platforms)
      - [`docker` (@backyard/platform-docker)](#docker-backyardplatform-docker)
      - [`node` (@backyard/platform-node)](#node-backyardplatform-node)
      - [`aws-ecs` (@backyard/platform-aws-ecs)](#aws-ecs-backyardplatform-aws-ecs)
      - [`aws-lambda` (@backyard/platform-aws-lambda)](#aws-lambda-backyardplatform-aws-lambda)
      - [`terraform` (@backyard/platform-terraform)](#terraform-backyardplatform-terraform)
    - [Services (`service/`)](#services-service)
      - [`gotrue` (@backyard/service-gotrue)](#gotrue-backyardservice-gotrue)
      - [`kong` (@backyard/service-kong)](#kong-backyardservice-kong)
      - [`postgresql` (@backyrad/service-postgresql)](#postgresql-backyradservice-postgresql)
      - [`postgresql-migrate` (@backyrad/service-postgresql-migrate)](#postgresql-migrate-backyradservice-postgresql-migrate)
      - [`postgrest` (@backyrad/service-postgrest)](#postgrest-backyradservice-postgrest)
    - [Tools (`tools/`)](#tools-tools)
      - [`create` (create-backyard)](#create-create-backyard)
      - [`docs-web` (@backyard/tool-docs-web)](#docs-web-backyardtool-docs-web)
      - [`test` (@backyard/tool-test)](#test-backyardtool-test)
      - [`typescript` (@backyard/tool-typescript)](#typescript-backyardtool-typescript)
    - [`types` (@backyard/types)](#types-backyardtypes)

## Folder Structure
All folders should follow the following structure

```
 ./package
  ./config          files used to configure dev tools
  ./bin             executable scripts included in the packaged
  ./scripts         executable script used in development or build.
  ./src             source files
  package.json
  tsconfig.json
  readme.md
```

### Files

  - `package.json` - required (example below). make sure to follow the standard package naming convention
  - `tsconfig.json` - (example below). should always extend the base typescript config at `<root>/config/tsconfig.base.json`
  - `readme.md` - required (example below)

#### Package Example

#### Typescript Configuration Example

#### ReadMe Example

---

##  Packages

### `cli` (@backyard/cli)
Command line interface. Installs to `backyard` and `by`

![npm (scoped)](https://img.shields.io/npm/v/@backyard/cli)

---

### `common` (@backyard/common)
Shared utility code. Also exports standard packages like `ts-invariant`, `uuid` and `debug` that are used by multiple child packages

![npm (scoped)](https://img.shields.io/npm/v/@backyard/common)

---

### `context` (@backyard/context)
Context represents a Backyard workspace. It handles reading configuration, building & managing the `.backyard/` folder, and initializing services & maintaining state of services.

![npm (scoped)](https://img.shields.io/npm/v/@backyard/context)

---

### Platforms (`platforms/`)
Platforms define infrastructure and runtime environments for `local` and `remote` development. Platforms do not provide services or plugins.

#### `docker` (@backyard/platform-docker)
Used as the default platform for `local` development

![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-docker)

#### `node` (@backyard/platform-node)

![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-node)

#### `aws-ecs` (@backyard/platform-aws-ecs)

![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-aws-ecs)

#### `aws-lambda` (@backyard/platform-aws-lambda)

![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-aws-lambda)

#### `terraform` (@backyard/platform-terraform)

![npm (scoped)](https://img.shields.io/npm/v/@backyard/platform-terraform)

---

### Services (`service/`)
Core maintained services

#### `gotrue` (@backyard/service-gotrue)
Default `auth` services

![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-gotrue)

#### `kong` (@backyard/service-kong)
Default `gateway` service

![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-kong)

#### `postgresql` (@backyrad/service-postgresql)
Default `db` service

![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgresql)

#### `postgresql-migrate` (@backyrad/service-postgresql-migrate)
Used to initialize `local` and `remote` databases

![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgresql-migrate)

#### `postgrest` (@backyrad/service-postgrest)
Default `store` service

![npm (scoped)](https://img.shields.io/npm/v/@backyard/service-postgrest)

---

### Tools (`tools/`)
Tools provide utilities and packages for building Backyard

#### `create` (create-backyard)
`create-backyard` package that powers `npx create-backyard` & `yarn create backyard`

![npm (scoped)](https://img.shields.io/npm/v/create-backyard)

#### `docs-web` (@backyard/tool-docs-web)
Docusaurus configuration and source for build `<root>/docs` folder. Lives at https://backyard.io/docs`

#### `test` (@backyard/tool-test)
Meta package for `jest`. Jest base config is in `<root>/config/jest.base.js` Provides shortcuts for:

 - `backyard-tools-jest` -> `jest`
 - `backyard-tools-ts-jest` -> `ts-jest`


#### `typescript` (@backyard/tool-typescript)
Meta package for `typescript` & `ts-node`. Provides shortcuts for:

 - `backyard-tools-tsc` -> `tsc`
 - `backyard-tools-ts-node` -> `ts-node -r tsconfig-paths/register`,
 - `backyard-tools-ts-node-dev` -> `ts-node-dev`


---

### `types` (@backyard/types)
Provides global types for Backyard.

![npm (scoped)](https://img.shields.io/npm/v/@backyard/types)

