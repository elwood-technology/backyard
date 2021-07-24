import { extname, isAbsolute, join, resolve } from 'path';

import * as filesystem from 'fs-jetpack';

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
): Promise<Configuration | undefined> {
  const { BACKYARD_CONFIG } = process.env;

  function requireConfigFile(file: string): Configuration | undefined {
    return requireModule<Configuration>(file, [join(cwd, 'node_modules')]);
  }

  if (BACKYARD_CONFIG) {
    return requireConfigFile(
      isAbsolute(BACKYARD_CONFIG)
        ? BACKYARD_CONFIG
        : resolve(cwd, BACKYARD_CONFIG),
    );
  }

  const found = await filesystem.findAsync(cwd, {
    matching: ['backyard.@(js|ts|json|yaml)', '!node_modules/**/*'],
    files: true,
    directories: false,
    recursive: false,
  });

  if (found.length === 0) {
    return undefined;
  }

  const configFile = found[0];

  switch (extname(configFile)) {
    case '.yaml':
      return {};
    case '.json':
      return filesystem.read(configFile, 'json');
    case '.ts':
      registerTsNode();
    default:
      return requireConfigFile(configFile);
  }
}

export async function loadAndNormalizeConfiguration(
  cwd: string,
): Promise<FullConfiguration> {
  return normalizeConfig((await loadConfiguration(cwd)) || {});
}
