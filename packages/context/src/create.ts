import { join, resolve } from 'path';

import * as filesystem from 'fs-jetpack';
import jwt from 'jsonwebtoken';
import { config as loadDotEnv } from 'dotenv';

import { invariant } from '@backyard/common';
import type {
  ConfigurationServiceDatabaseSettings,
  Context,
  ContextMode,
  FullConfiguration,
} from '@backyard/types';

import { loadAndNormalizeConfiguration } from './configuration';
import { buildUserServicesMap, buildCoreServicesSettingsMap } from './services';
import { createSitesMap } from './sites';
import {
  createBuildCoreServiceSettings,
  createDevCoreServiceSettings,
} from './mode';

export type CreateContextArgs = {
  mode: ContextMode;
  cwd?: string;
};

enum EnvName {
  Cwd = 'BACKYARD_CWD',
  Root = 'BACKYARD_ROOT_DIR',
  Backyard = 'BACKYARD_BY_DIR',
}

export async function createContext(args: CreateContextArgs): Promise<Context> {
  const { mode } = args;
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

  const config = await loadAndNormalizeConfiguration(cwd);
  const rootDir = getRootDir(config, cwd);

  invariant(
    filesystem.exists(rootDir),
    `Root directory "${rootDir}" does not exist`,
  );

  const backyardDir = getBackyardDir(config, rootDir);

  const destDir = join(backyardDir, mode);
  const sourceDir = getSourceDir(config, rootDir);

  const userServices = await buildUserServicesMap(config, sourceDir);
  const coreServiceSettings = await buildCoreServicesSettingsMap(
    config,
    mode === 'dev'
      ? createDevCoreServiceSettings()
      : createBuildCoreServiceSettings(),
  );
  const sitesMap = await createSitesMap(
    config,
    sourceDir,
    coreServiceSettings.devServer?.port ?? 3000,
  );

  return {
    mode,
    config,
    dbUri: createDbUri(coreServiceSettings.db),
    userServices,
    coreServiceSettings,
    sitesMap,
    dir: {
      cwd,
      root: rootDir,
      source: sourceDir,
      backyard: backyardDir,
      dest: destDir,
    },
    keys: createKeys(destDir, config.jwt.secret),
  };
}

export function createDbUri(db: ConfigurationServiceDatabaseSettings): string {
  return `postgres://${db.user}:${db.password}@${db.containerHost}:${db.port}/${db.name}?sslmode=disable`;
}

export function createKeys(destDir: string, secret: string): Context['keys'] {
  const keysFile = join(destDir, 'keys.json');

  if (filesystem.exists(keysFile)) {
    return filesystem.read(keysFile, 'json') as Context['keys'];
  }

  const iat = new Date().getTime() / 1000;
  const exp = iat + 60 * 60 * 24 * 365 * 50;

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
