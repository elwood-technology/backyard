import deepMerge from 'deepmerge';
import { compile as template } from 'ejs';

import type {
  Context,
  ConfigurationService,
  ServiceHooks,
  Json,
} from '@backyard/types';
import { isFunction } from '@backyard/common';

export type ResolveServiceConfigArgs = {
  initialConfig: ConfigurationService;
  context: Context;
  hooks: ServiceHooks;
  platformHooks: ServiceHooks;
};

export async function resolveServiceConfig(
  args: ResolveServiceConfigArgs,
): Promise<ConfigurationService> {
  const { initialConfig, context, hooks, platformHooks } = args;
  let config = deepMerge(
    {
      settings: {},
      gateway: {
        enabled: false,
      },
      container: {
        enabled: false,
      },
    },
    initialConfig,
  ) as ConfigurationService;

  if (isFunction(hooks.config)) {
    config = deepMerge(config, await hooks.config(context, config));
  }

  if (isFunction(platformHooks.config)) {
    config = deepMerge(config, await platformHooks.config(context, config));
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
