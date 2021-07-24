import type { Context } from '@backyard/types';

import { DockerComposeService, KongService } from '../types';

export function storageDockerCompose(state: Context): DockerComposeService {
  const { storage, rest } = state.coreServiceSettings;

  return {
    container_name: 'by-storage',
    image: 'supabase/storage-api',
    ports: [[storage.port, storage.containerPort].join(':')],
    depends_on: ['db', 'rest'],
    restart: 'on-failure',
    environment: {
      ANON_KEY: state.keys.anon,
      SERVICE_KEY: state.keys.service,
      PROJECT_REF: storage.projectRef,
      REGION: storage.aws.region,
      POSTGREST_URL: `http://${rest.containerHost}:${rest.port}`,
      GLOBAL_S3_BUCKET: storage.aws.bucket,
      PGRST_JWT_SECRET: state.config.jwt.secret,
      DATABASE_URL: state.dbUri,
      PGOPTIONS: '-c search_path=storage',
      AWS_ACCESS_KEY_ID: storage.aws.key,
      AWS_SECRET_ACCESS_KEY: storage.aws.secret,
      FILE_SIZE_LIMIT: 52428800,
    },
  };
}

export function storageKongService(_state: Context): KongService {
  return {
    name: 'storage-v1',
    _comment: 'Storage: /storage/v1/* -> http://storage-api:5000/*',
    url: 'http://storage:5000/',
    routes: [
      {
        name: 'storage-v1-all',
        strip_path: true,
        paths: ['/storage/v1/'],
      },
    ],
    plugins: [
      { name: 'cors' },
      { name: 'key-auth', config: { hide_credentials: true } },
    ],
  };
}
