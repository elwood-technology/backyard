import { extname, dirname, isAbsolute, join, resolve } from 'path';

import * as filesystem from 'fs-jetpack';
import { parse as yaml } from 'yaml';

import { requireModule } from '@backyard/common';
import type { Configuration, FullConfiguration } from '@backyard/types';

import { normalizeConfig } from './normalize';

function registerTsNode(): void {
  if (!require.extensions['.ts']) {
    require('ts-node').register({});
  }
}

export async function loadConfiguration(
  cwd: string,
): Promise<FullConfiguration | undefined> {
  const { BACKYARD_CONFIG } = process.env;

  if (BACKYARD_CONFIG) {
    const file = isAbsolute(BACKYARD_CONFIG)
      ? BACKYARD_CONFIG
      : resolve(cwd, BACKYARD_CONFIG);
    return createFullConfiguration(loadConfigFromFile(file, cwd), file);
  }

  const fs = filesystem.cwd(cwd);

  const found = await fs.findAsync(cwd, {
    matching: ['backyard.@(js|ts|json|yaml)', '!node_modules/**/*'],
    files: true,
    directories: false,
    recursive: false,
  });

  if (found.length === 0) {
    return undefined;
  }

  const file = resolve(cwd, found[0]);

  return createFullConfiguration(loadConfigFromFile(file, cwd), file);
}

export function createFullConfiguration(
  config: Configuration,
  file: string,
): FullConfiguration {
  return {
    ...config,
    _configFileRoot: dirname(file),
  } as FullConfiguration;
}

export function loadConfigFromFile(
  configFile: string,
  cwd: string,
): Configuration {
  switch (extname(configFile)) {
    case '.yaml':
      return yaml(configFile);
    case '.json':
      return filesystem.read(configFile, 'json');
    case '.ts':
      // don't return here
      registerTsNode();
    default:
      return requireModule<Configuration>(configFile, [
        join(cwd, 'node_modules'),
      ]) as Configuration;
  }
}

export async function loadAndNormalizeConfiguration(
  cwd: string,
  initialConfig: Configuration = {},
): Promise<FullConfiguration> {
  const loadedConfig = (await loadConfiguration(cwd)) ?? {};
  return normalizeConfig(loadedConfig, initialConfig);
}
