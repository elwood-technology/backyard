import deepMerge from 'deepmerge';
import { compile as template } from 'ejs';

import type {
  Context,
  ConfigurationService,
  ServiceHooks,
  Json,
  Platform,
} from '@backyard/types';
import { isFunction } from '@backyard/common';

export type ResolveServiceConfigArgs = {
  initialConfig: ConfigurationService;
  context: Context;
  hooks: ServiceHooks;
  platform?: Platform;
};

export async function resolveServiceConfig(
  args: ResolveServiceConfigArgs,
): Promise<ConfigurationService> {
  const { initialConfig, context, hooks, platform } = args;
  let config = deepMerge(initialConfig, {
    settings: {},
    gateway: {},
    container: {},
  }) as ConfigurationService;

  if (isFunction(hooks.config)) {
    config = deepMerge.all([
      await hooks.config(context, config),
      initialConfig,
    ]);
  }

  if (platform && isFunction(platform.config)) {
    config = deepMerge(config, await platform.config(context, config));
  }

  return config;
}

export async function replaceConfigTemplateVariables(
  obj: Json,
  context: Context,
): Promise<Json> {
  if (typeof obj === 'string') {
    const tpl = template(obj, { async: true });

    return await tpl({
      context,
    });
  }

  if (Array.isArray(obj) || typeof obj === 'object') {
    for (const item in obj) {
      obj[item] = await replaceConfigTemplateVariables(obj[item], context);
    }
  }

  return obj;
}
