# Backyard

An opinioned microservices platform.

## Status
:warning: Not Stable :warning:

Backyard is still under heavy development. The documentation is mostly not available but constantly being written. You're welcome to try it, but expect some breaking changes. Please [report any bugs](https://github.com/elwood-technology/backyard/issues/new/choose) and [ask many questions](https://github.com/elwood-technology/backyard/discussions). [Contributions](https://github.com/elwood-technology/backyard#contributing) much appreciated!

## Overview
Backyard eases the development and deployment of microservices by providing an opinionated platform for business tool API & UI and static frontends.

### Core Services
- [API Gateway](./packages/service/kong)
- [Authentication](./packages/service/gotrue)
- [Database](./packages/service/postgres)
- [Rest API](./packages/service/postgrest)

### Additional Services
 - [UI](./packages/services/ui)
 - [Authorization](./packages/service/zuul)
 - [Notifications](./packages/service/notifications)
 - [Activity](./packages/services/activity)
 - [Event Bus](./packages/service/events)

## Installation

```bash
# typescript
yarn create backyard -ts

# javascript
yarn create backyard

# NPM
npx create-backyard
```

## Usage
See the [docs](./docs) for more information.

## Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated. Look for [Good First Issue](https://github.com/elwood-technology/backyard/labels/good%20first%20issue)!

- Fork the Project
- Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
- Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the Branch (`git push origin feature/AmazingFeature`)
- [Open a Pull Request](https://github.com/elwood-technology/backyard/compare)

## License
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

## Contact
- Travis Kuhl - @traviskuhl - travis@elwood.technology

