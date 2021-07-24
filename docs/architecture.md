# Architecture

- [Architecture](#architecture)
  - [Folder Structure & Packages](#folder-structure--packages)
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
      - [`ui` (@backyrad/service-ui)](#ui-backyradservice-ui)
      - [`zuul` (@backyrad/service-zuul)](#zuul-backyradservice-zuul)
    - [Tools (`tools/`)](#tools-tools)
      - [`create` (create-backyard)](#create-create-backyard)
      - [`docs-web` (@backyard/tool-docs-web)](#docs-web-backyardtool-docs-web)
      - [`test` (@backyard/tool-test)](#test-backyardtool-test)
      - [`typescript` (@backyard/tool-typescript)](#typescript-backyardtool-typescript)
    - [`types` (@backyard/types)](#types-backyardtypes)
    - [UI (`ui/`)](#ui-ui)
      - [`react` (@backyard/ui-react)](#react-backyardui-react)

## Folder Structure & Packages

### `cli` (@backyard/cli)
Command line interface. Installs to `backyard` and `by`

---

### `common` (@backyard/common)
Shared utility code. Also exports standard packages like `ts-invariant`, `uuid` and `debug` that are used by multiple child packages

---

### `context` (@backyard/context)
Context represents a Backyard workspace. It handles reading configuration, building & managing the `.bacyard/` folder, and initializing services & maintaining state of services.

---

### Platforms (`platforms/`)
Platforms define infrastructure and runtime environments for `local` and `remote` development. Platforms do not provide services or plugins.

#### `docker` (@backyard/platform-docker)
Used as the default platform for `local` development

#### `node` (@backyard/platform-node)

#### `aws-ecs` (@backyard/platform-aws-ecs)

#### `aws-lambda` (@backyard/platform-aws-lambda)

#### `terraform` (@backyard/platform-terraform)

---

### Services (`service/`)
Core maintained services

#### `gotrue` (@backyard/service-gotrue)
Default `auth` services

#### `kong` (@backyard/service-kong)
Default `gateway` service

#### `postgresql` (@backyrad/service-postgresql)
Default `db` service

#### `postgresql-migrate` (@backyrad/service-postgresql-migrate)
Used to initialize `local` and `remote` databases

#### `postgrest` (@backyrad/service-postgrest)
Default `store` service

#### `ui` (@backyrad/service-ui)
UI service

#### `zuul` (@backyrad/service-zuul)
Default `authz` service

---

### Tools (`tools/`)
Tools provide utilities and packages for building Backyard

#### `create` (create-backyard)
`create-backyard` package that powers `npx create-backyard` & `yarn create backyard`

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



---

### UI (`ui/`)
Packages to build a Backyard Service UI

#### `react` (@backyard/ui-react)
React containers & hooks to connect a Backyard Service UI
