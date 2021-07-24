import { join, dirname } from 'path';

import { filesystem } from 'gluegun';
import findUp from 'find-up';

import type { ConfigurationService, ServiceHooks } from '@backyard/types';

import { invariant } from '@backyard/common';

import {
  loadServicesModuleHooks,
  loadServicesModuleHooksFromFile,
} from './hooks';

export type LoadServiceResult = {
  name: string;
  moduleRootPath: string;
  apiModulePath?: string;
  uiModulePath?: string;
  hooks: ServiceHooks;
  platformHooks: ServiceHooks;
  type?: string;
};

export async function loadService(
  initialConfig: ConfigurationService,
): Promise<LoadServiceResult> {
  invariant(initialConfig.provider, 'Service must have provider');

  const pkgFile = await getPackageFilePath(initialConfig.provider);

  if (!pkgFile) {
    throw new Error('bad root module');
  }

  const moduleRootPath = dirname(pkgFile);

  const apiModulePath = filesystem
    .find(moduleRootPath, {
      matching: 'backyard-api.*',
    })
    ?.shift();

  const uiModulePath = filesystem
    .find(moduleRootPath, {
      matching: 'backyard-ui.*',
    })
    ?.shift();

  const name = initialConfig.name;

  invariant(name, `Unable to find name for service in "${moduleRootPath}"`);

  const hooks = await loadServicesModuleHooks(moduleRootPath);
  const config = initialConfig as ConfigurationService & { type?: string };

  return {
    name,
    type: config.type ?? 'unknown',
    moduleRootPath,
    apiModulePath,
    uiModulePath,
    hooks,
    platformHooks: config.platform
      ? loadServicesModuleHooksFromFile(config.platform)
      : {},
  };
}

export async function getPackageFilePath(
  provider: string,
): Promise<string | undefined> {
  if (filesystem.isFile(provider)) {
    return getPackageFilePath(dirname(provider));
  }

  if (filesystem.isDirectory(provider)) {
    if (filesystem.exists(join(provider, 'package.json'))) {
      return join(provider, 'package.json');
    }

    return await findUp('package.json', {
      cwd: provider,
    });
  }

  return getPackageFilePath(require.resolve(provider));
}
