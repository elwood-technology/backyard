import { join, dirname } from 'path';

import { filesystem } from 'gluegun';
import findUp from 'find-up';
import defaults from 'lodash.defaultsdeep';

import type {
  Context,
  ConfigurationService,
  ContextService,
} from '@backyard/types';

import { invariant, isFunction } from '@backyard/common';

import { resolveServiceConfig } from './config';
import { ContextServiceState, ContextServiceStateInput } from './state';
import {
  loadServicesModuleHooks,
  loadServicesModuleHooksFromFile,
} from './hooks';

export async function loadService(
  context: Context,
  initialConfig: ConfigurationService,
): Promise<ContextService> {
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
  let platformHooks = initialConfig.platform
    ? loadServicesModuleHooksFromFile(initialConfig.platform)
    : {};

  let config = (await resolveServiceConfig({
    context,
    initialConfig,
    hooks,
    platformHooks,
  })) as ContextServiceStateInput['config'] & {
    type?: string;
  };

  // it's possible that service.config hook set
  // a platform. we should use that here, and merge it
  // with what was already set
  if (config.platform) {
    const newPlatformHooks = loadServicesModuleHooksFromFile(config.platform);

    platformHooks = {
      ...newPlatformHooks,
      ...platformHooks,
      hooks: {
        ...newPlatformHooks.hooks,
        ...platformHooks.hooks,
      },
    };
  }

  // give the platform hooks a chance to update config
  if (isFunction(platformHooks.config)) {
    config = defaults(config, await platformHooks.config(context, config));
  }

  const input: ContextServiceStateInput = {
    type: config.type ?? 'unknown',
    moduleRootPath,
    apiModulePath,
    uiModulePath,
    config,
    hooks,
    platformHooks,
  };

  return new ContextServiceState(context, input);
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
