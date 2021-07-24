# Backyard

An opinioned microservices platform.

## Status
:warning: Not Stable :warning:

Backyard is still under heavy development. The documentation is mostly not available but constantly being written. You're welcome to try it, but expect some breaking changes.

## Overview
Backyard eases the development and deployment of microservices by providing an opinionated platform for business tool API & UI and static frontends.

### Core Services
- [Database](https://github.com/supabase/postgres)
- [API Gateway](https://github.com/Kong/kong)
- [Rest API](https://github.com/PostgREST/postgrest)
- [Auth](https://github.com/netlify/gotrue)

### Additional Services
 - [File System](./packages/service/fs)
 - [Event Bus](./packages/service/events)
 - [Messages](./packages/services/messages)

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
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
Distributed under the MIT License. See LICENSE for more information.

## Contact
Travis Kuhl - @traviskuhl - travis@elwood.technology

Project Link: https://backyard.io
