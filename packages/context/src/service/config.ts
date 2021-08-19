import deepMerge from 'deepmerge';
import { compile as template } from 'ejs';

import type {
  Context,
  ConfigurationService,
  ServiceHooks,
  Json,
  ContextPlatform,
  ContextPlatformTypeName,
  JsonObject,
} from '@backyard/types';
import { isFunction } from '@backyard/common';

export type ResolveServiceConfigArgs = {
  initialConfig: ConfigurationService;
  context: Context;
  hooks: ServiceHooks;
  platform?: ContextPlatform<ContextPlatformTypeName, string>;
};

function cleanObject(obj: JsonObject): JsonObject {
  let newObj = {} as JsonObject;
  Object.keys(obj).forEach((key) => {
    if (!Array.isArray(obj[key]) && typeof obj[key] === 'object') {
      newObj[key] = cleanObject(obj[key] as JsonObject);
    } else if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
}

export function mergeConfigurationService(
  src: Partial<ConfigurationService>,
  dest: Partial<ConfigurationService>,
): ConfigurationService {
  return deepMerge(cleanObject(src), cleanObject(dest), {
    arrayMerge(_target, source) {
      return source;
    },
  }) as ConfigurationService;
}

export async function resolveServiceConfig(
  args: ResolveServiceConfigArgs,
): Promise<ConfigurationService> {
  const { initialConfig, context, hooks, platform } = args;
  let config = mergeConfigurationService(initialConfig, {
    settings: {},
    gateway: { enabled: false },
    container: {},
  });

  if (isFunction(hooks.config)) {
    config = mergeConfigurationService(
      await hooks.config(context, config),
      initialConfig,
    );
  }

  if (platform && isFunction(platform.config)) {
    config = mergeConfigurationService(
      config,
      await platform.config(context, config),
    );
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
