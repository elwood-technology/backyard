import { ContextCoreServicesSettingsMap } from '@backyard/types';

export function createDevCoreServiceSettings(): ContextCoreServicesSettingsMap {
  return {
    db: {
      containerPort: 5432,
      containerHost: 'db',
      name: 'backyard',
      user: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'asdasd',
    },
    auth: {
      containerPort: 9999,
      containerHost: 'auth',
      disableSignUp: false,
      host: '127.0.0.1',
      externalUrl: 'localhost',
      port: 9999,
      smtp: {
        host: '',
        port: 0,
        user: '',
        pass: '',
      },
    },
    kong: {
      containerPort: 8000,
      containerHost: 'kong',
      port: 8000,
      tlsPort: 8443,
    },
    rest: {
      port: 4000,
      containerPort: 4000,
      containerHost: 'rest',
    },
    storage: {
      port: 4001,
      containerPort: 4001,
      containerHost: 'storage',
      projectRef: 'by',
      aws: {
        bucket: '',
        region: '',
        key: '',
        secret: '',
      },
    },
    realtime: {
      containerHost: 'realtime',
      containerPort: 4002,
      port: 4002,
    },
    devServer: {
      sites: true,
      port: 3000,
      containerPort: 3000,
      containerHost: 'devServer',
      watch: false,
      watchPaths: [],
    },
  };
}

export function createBuildCoreServiceSettings(): ContextCoreServicesSettingsMap {
  return {
    db: {
      containerPort: 5432,
      containerHost: '127.0.0.1',
      name: 'backyard',
      user: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      password: 'IRN0fcwSaqDSwURoMHbg',
    },
    auth: {
      containerPort: 9999,
      containerHost: '127.0.0.1',
      disableSignUp: true,
      host: '127.0.0.1',
      externalUrl: 'localhost',
      port: 9999,
      smtp: {
        host: '',
        port: 0,
        user: '',
        pass: '',
      },
    },
    kong: {
      containerPort: 8000,
      containerHost: '127.0.0.1',
      port: 80,
      tlsPort: 8443,
    },
    rest: {
      port: 4000,
      containerHost: '127.0.0.1',
      containerPort: 4000,
    },
    storage: {
      port: 4001,
      containerPort: 4001,
      containerHost: '127.0.0.1',
      projectRef: 'by',
      aws: {
        bucket: '',
        region: '',
        key: '',
        secret: '',
      },
    },
    realtime: {
      containerPort: 4002,
      containerHost: '127.0.0.1',
      port: 4002,
    },
  };
}
