import { join, resolve } from 'path';

import which from 'which';
import * as filesystem from 'fs-jetpack';
import { config as loadDotEnv } from 'dotenv';

import { invariant, debug, ContextModeLocal } from '@backyard/common';
import type {
  Configuration,
  Context,
  ContextMode,
  FullConfiguration,
  ContextService,
} from '@backyard/types';

import { loadAndNormalizeConfiguration } from './config';
import {
  readCoreServicesFromConfiguration,
  readServicesFromSource,
  readUsersServicesFromConfiguration,
} from './service';
import { loadPlatforms } from './platform';
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
  const { mode, settings = {}, initialConfig = {} } = args;
  const envName = mode === ContextModeLocal ? '.env.local' : '.env.remote';
  const { BACKYARD_CWD, BACKYARD_ENV_FILE, BACKYARD_IGNORE_ENV_FILE } =
    process.env ?? {};
  const cwd = resolve(BACKYARD_CWD ?? args.cwd ?? process.cwd());

  log('start');

  invariant(
    filesystem.exists(cwd),
    `Current working directory ("${cwd}") does not exist`,
  );

  if (BACKYARD_ENV_FILE) {
    loadDotEnv({
      path: BACKYARD_ENV_FILE,
    });
  }

  if (BACKYARD_IGNORE_ENV_FILE !== 'true') {
    loadDotEnv({
      path: join(cwd, envName),
    });
  }

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

  context.platforms.local.setContext(context);
  context.platforms.remote?.setContext(context);

  const allServices = [
    ...(await readCoreServicesFromConfiguration(config)),
    ...(sourceDir === 'skip' ? [] : await readServicesFromSource(sourceDir)),
    ...(await readUsersServicesFromConfiguration(config)),
  ].filter((item) => item.enabled !== false);

  log('found services: %s', allServices.map((item) => item.name).join(', '));

  const services: ContextService[] = [];

  for (const serviceConfig of allServices) {
    services.push(await context.addService(serviceConfig, false));
  }

  log('initalizing services');

  for (const service of services) {
    await service.init();
  }

  log('finalizing services');

  for (const service of services) {
    await service.finalize();
  }

  return context;
}

export function getSourceDir(
  config: FullConfiguration,
  rootDir: string,
): string {
  const { BACKYARD_SRC_DIR } = process.env;

  if (BACKYARD_SRC_DIR) {
    return resolve(rootDir, BACKYARD_SRC_DIR);
  }

  if (config.resolve?.source === 'skip') {
    return 'skip';
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
