import { join, resolve } from 'path';

import which from 'which';
import * as filesystem from 'fs-jetpack';
import { config as loadDotEnv } from 'dotenv';

import { invariant, debug, requireModule } from '@backyard/common';
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
  readCoreServicesFromConfiguration,
  readServicesFromSource,
  readUsersServicesFromConfiguration,
} from './service';

import { ContextState } from './state';

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

const log = debug('backyard:context:create');

export async function createContext(args: CreateContextArgs): Promise<Context> {
  log('start');

  const { mode, settings = {}, initialConfig = {} } = args;
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

  const context = new ContextState({
    log() {},
    mode,
    config,
    settings,
    dir: {
      cwd,
      root: rootDir,
      source: sourceDir,
      backyard: backyardDir,
      stage: destDir,
      state: stateDir,
    },
    tools: {
      filesystem,
      which,
    },
    platforms: loadPlatforms(config),
  });

  const allServices = [
    ...(await readCoreServicesFromConfiguration(config)),
    ...(await readServicesFromSource(sourceDir)),
    ...(await readUsersServicesFromConfiguration(config)),
  ].filter((item) => item.enabled !== false);

  const services: string[] = [];

  for (const serviceConfig of allServices) {
    await context.addService(serviceConfig, false);
    services.push(serviceConfig.name);
  }

  log('initalizing services');

  for (const name of services) {
    await (context.getService(name) as Service).init();
  }

  log('finalizing services');

  for (const name of services) {
    await (context.getService(name) as Service).finalize();
  }

  return context;
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

  if (filesystem.exists(join(rootDir, 'packages'))) {
    return join(rootDir, 'packages');
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
