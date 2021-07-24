import { join, resolve } from 'path';

import which from 'which';
import * as filesystem from 'fs-jetpack';
import jwt from 'jsonwebtoken';
import { config as loadDotEnv } from 'dotenv';

import {
  invariant,
  requireModule,
  createDbUrlFromContext,
} from '@backyard/common';
import type {
  RemotePlatform,
  Configuration,
  Context,
  ContextMode,
  LocalPlatform,
  FullConfiguration,
} from '@backyard/types';

import { loadAndNormalizeConfiguration } from './config';
import {
  Service,
  addServiceToContext,
  readCoreServicesFromConfiguration,
  readServicesFromSource,
  readUsersServicesFromConfiguration,
} from './service';

export type CreateContextArgs = {
  mode: ContextMode;
  cwd?: string;
  log?: Context['log'];
  initialConfig?: Configuration;
  settings?: Context['settings'];
};

enum EnvName {
  Cwd = 'BACKYARD_CWD',
  Root = 'BACKYARD_ROOT_DIR',
  Backyard = 'BACKYARD_BY_DIR',
}

function defaultLogger(msg: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(msg);
  }
}

export async function createContext(args: CreateContextArgs): Promise<Context> {
  const { mode, log = defaultLogger, settings = {}, initialConfig = {} } = args;
  const { BACKYARD_CWD } = process.env ?? {};

  const cwd = resolve(BACKYARD_CWD ?? args.cwd ?? process.cwd());

  invariant(
    filesystem.exists(cwd),
    `Current working directory ("${cwd}") does not exist`,
  );

  if (filesystem.exists(join(cwd, '.env'))) {
    loadDotEnv({
      path: join(cwd, '.env'),
    });
  }

  const config = await loadAndNormalizeConfiguration(cwd, initialConfig);
  const rootDir = getRootDir(config, cwd);

  invariant(
    filesystem.exists(rootDir),
    `Root directory "${rootDir}" does not exist`,
  );

  const backyardDir = getBackyardDir(config, rootDir);
  const destDir = join(backyardDir, mode);
  const sourceDir = getSourceDir(config, rootDir);
  const stateDir = join(backyardDir, 'state');

  const services = new Map<string, Service>();

  const context: Context = {
    log,
    mode,
    config,
    services,
    settings,
    sitesMap: new Map(),
    dir: {
      cwd,
      root: rootDir,
      source: sourceDir,
      backyard: backyardDir,
      stage: destDir,
      state: stateDir,
    },
    keys: createKeys(destDir, config),
    tools: {
      filesystem,
      which,
    },
    platforms: loadPlatforms(config),
    createDbUrl() {
      return createDbUrlFromContext(context);
    },
    async addService(config) {
      addServiceToContext(context, config, true);
    },
    serviceInternalUrl(serviceName: string) {
      const gateway = context.services.get('gateway');
      return `http://${gateway?.container?.host}:${gateway?.container?.port}/${serviceName}/v1`;
    },
    serviceExternalUrl(serviceName: string) {
      const gateway = context.services.get('gateway');
      const host = gateway?.container?.externalHost ?? '0.0.0.0';

      if (serviceName === 'gateway') {
        return `http://${host}:${gateway?.container?.externalPort}`;
      }

      return `http://${host}:${gateway?.container?.externalPort}/${serviceName}/v1`;
    },
  };

  const allServices = [
    ...(await readCoreServicesFromConfiguration(config)),
    ...(await readServicesFromSource(sourceDir)),
    ...(await readUsersServicesFromConfiguration(config)),
  ].filter((item) => item.enabled !== false);

  await Promise.all(
    allServices.map(async (serviceConfig) => {
      await addServiceToContext(context, serviceConfig);
    }),
  );

  for (const [_, service] of services) {
    await service.init();
  }

  for (const [_, service] of services) {
    await service.finalize();
  }

  return context;
}

export function createKeys(
  destDir: string,
  config: Configuration,
): Context['keys'] {
  const keysFile = join(destDir, 'keys.json');
  const secret = String(config.jwt?.secret);
  const iat = config.jwt?.iat ?? new Date().getTime() / 1000;
  const exp = config.jwt?.exp ?? iat + 60 * 60 * 24 * 365 * 50;

  if (filesystem.exists(keysFile)) {
    return filesystem.read(keysFile, 'json') as Context['keys'];
  }

  const anonKey = jwt.sign(
    {
      iss: 'backyard',
      iat,
      exp,
      aud: '',
      sub: '',
      Role: 'anon',
    },
    secret,
  );
  const serviceKey = jwt.sign(
    {
      iss: 'backyard',
      iat,
      exp,
      aud: '',
      sub: '',
      Role: 'service_role',
    },
    secret,
  );

  return {
    anon: anonKey,
    service: serviceKey,
  };
}

export function loadPlatforms(config: Configuration): Context['platforms'] {
  const localPlatform = config.platform?.local ?? '@backyard/platform-docker';
  const RemotePlatform =
    config.platform?.remote ?? '@backyard/platform-aws-ecs';

  const { local } =
    requireModule<{ local: LocalPlatform }>(localPlatform) ?? {};
  const { remote } =
    requireModule<{ remote: RemotePlatform }>(RemotePlatform) ?? {};

  invariant(local, 'Unable to load local platform');
  invariant(remote, 'Unable to load remote platform');

  return {
    local,
    remote,
  };
}

export function getSourceDir(
  config: FullConfiguration,
  rootDir: string,
): string {
  const { BACKYARD_SRC_DIR } = process.env;

  if (BACKYARD_SRC_DIR) {
    return resolve(rootDir, BACKYARD_SRC_DIR);
  }

  if (config.resolve?.source) {
    return resolve(config.resolve.source);
  }

  if (filesystem.exists(join(rootDir, 'src'))) {
    return join(rootDir, 'src');
  }

  return rootDir;
}

export function getRootDir(config: FullConfiguration, cwd: string): string {
  const { [EnvName.Root]: root } = process.env;

  if (root) {
    return resolve(root);
  }

  if (config.root) {
    return resolve(config.root);
  }

  return cwd;
}

export function getBackyardDir(
  config: FullConfiguration,
  rootDir: string,
): string {
  const { [EnvName.Backyard]: by } = process.env;

  if (by) {
    return resolve(by);
  }

  if (config.resolve.backyard) {
    return resolve(config.resolve.backyard);
  }

  return join(rootDir, '.backyard');
}
