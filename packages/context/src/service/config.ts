import deepMerge from 'deepmerge';
import { compile as template } from 'ejs';

import type {
  Context,
  ConfigurationService,
  ServiceHooks,
  Json,
  ContextPlatform,
  ContextPlatformTypeName,
} from '@backyard/types';
import { isFunction } from '@backyard/common';

export type ResolveServiceConfigArgs = {
  initialConfig: ConfigurationService;
  context: Context;
  hooks: ServiceHooks;
  platform?: ContextPlatform<ContextPlatformTypeName, string>;
};

export async function resolveServiceConfig(
  args: ResolveServiceConfigArgs,
): Promise<ConfigurationService> {
  const { initialConfig, context, hooks, platform } = args;
  let config = deepMerge(
    initialConfig,
    {
      settings: {},
      gateway: {},
      container: {},
    },
    {
      arrayMerge(_target, source) {
        return source;
      },
    },
  ) as ConfigurationService;

  if (isFunction(hooks.config)) {
    config = deepMerge(await hooks.config(context, config), initialConfig, {
      arrayMerge(_target, source) {
        return source;
      },
    });
  }

  if (platform && isFunction(platform.config)) {
    config = deepMerge(config, await platform.config(context, config), {
      arrayMerge(_target, source) {
        return source;
      },
    });
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
