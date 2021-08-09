import { join, dirname } from 'path';

import { filesystem } from 'gluegun';
import findUp from 'find-up';
import deepMerge from 'deepmerge';

import type {
  Context,
  ConfigurationService,
  ContextService,
  ConfigurationPlatform,
  JsonObject,
  ConfigurationModule,
  Platform,
  ServiceHooks,
  ConfigurationServiceProviderOptions,
} from '@backyard/types';

import {
  ContextModeLocal,
  invariant,
  isFunction,
  AbstractPlatform,
} from '@backyard/common';

import { loadPlatform } from '../platform';
import { resolveServiceConfig } from './config';
import { ContextServiceState, ContextServiceStateInput } from './state';
import { loadServicesModuleHooks } from './hooks';

type ConfigWithType = ContextServiceStateInput['config'] & {
  type?: string;
};

export async function loadService(
  context: Context,
  initialConfig: ConfigurationService,
): Promise<ContextService> {
  invariant(initialConfig.provider, 'Service must have provider');

  const [providerModulePath, providerOptions] = normalizeModuleDef(
    initialConfig.provider,
  );

  const pkgFile = await getPackageFilePath(providerModulePath);

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
  const providerExtendHooks = await getProviderExtendedModule(providerOptions);
  let platform = loadServicePlatform(context, initialConfig.platform);

  let config = (await resolveServiceConfig({
    context,
    initialConfig,
    hooks,
    platform,
  })) as ConfigWithType;

  if (isFunction(providerExtendHooks.config)) {
    config = deepMerge(
      config,
      await providerExtendHooks.config(context, config),
    ) as ConfigWithType;
  }

  // it's possible that service.config hook set
  // a platform. we should use that here, and merge it
  // with what was already set
  if (config.platform) {
    platform = deepMerge(
      platform,
      loadServicePlatform(context, config.platform),
    );
  }

  // give the platform hooks a chance to update config
  if (isFunction(platform.config)) {
    config = deepMerge(
      config,
      await platform.config(context, config),
    ) as ConfigWithType;
  }

  const input: ContextServiceStateInput = {
    type: config.type ?? 'unknown',
    moduleRootPath,
    apiModulePath,
    uiModulePath,
    config,
    hooks,
    platform,
    providerExtendHooks,
  };

  return new ContextServiceState(context, input);
}

export async function getProviderExtendedModule(
  options: ConfigurationServiceProviderOptions | undefined,
): Promise<ServiceHooks> {
  if (!options?.extends) {
    return {};
  }

  const [extend] = normalizeModuleDef(options.extends);

  const pkgFile = await getPackageFilePath(require.resolve(extend));

  if (!pkgFile) {
    return {};
  }

  return await loadServicesModuleHooks(dirname(pkgFile));
}

export function normalizeModuleDef(
  mod: ConfigurationModule,
): [string, JsonObject] {
  if (typeof mod === 'string') {
    return [mod, {}];
  }

  if (mod.length === 1) {
    return [mod[0], {}];
  }

  return mod;
}

export function loadServicePlatform(
  context: Context,
  config: ConfigurationPlatform | undefined,
): Platform {
  if (!config) {
    return new (class extends AbstractPlatform {})();
  }

  const platform =
    context.mode === ContextModeLocal ? config.local : config.remote;

  return loadPlatform(platform);
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
