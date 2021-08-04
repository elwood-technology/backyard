import defaults from 'lodash.defaultsdeep';
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
  let config = defaults({}, initialConfig) as ConfigurationService;

  if (isFunction(hooks.config)) {
    config = defaults(await hooks.config(context, config), config);
  }

  if (isFunction(platformHooks.config)) {
    config = defaults(await platformHooks.config(context, config), config);
  }

  // run the core function again if it exists
  // this might seem weird, but we want it to be
  // the last configuration run
  if (isFunction(hooks.config)) {
    config = defaults(await hooks.config(context, config), config);
  }

  return defaults(initialConfig, config, {
    settings: {},
    gateway: {
      enabled: false,
    },
    container: {
      enabled: false,
    },
  });
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
