import defaults from 'lodash.defaultsdeep';

import type {
  Context,
  ContextService,
  ConfigurationService,
} from '@backyard/types';
import { isFunction, isEmptyObject } from '@backyard/common';

import { loadServicesModuleHooksFromFile } from './hooks';

export async function resolveServiceConfig(
  context: Context,
  service: ContextService,
  initialConfig: ConfigurationService,
): Promise<ConfigurationService> {
  const hooks = service.getHooks();
  let platformHooks = service.getPlatformHooks();
  let config = defaults({}, initialConfig) as ConfigurationService;

  if (isFunction(hooks.config)) {
    config = defaults(await hooks.config(context, config), config);
  }

  if (isEmptyObject(platformHooks) && config.platform) {
    platformHooks = loadServicesModuleHooksFromFile(config.platform);
    service.setPlatformHooks(platformHooks);
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

  return defaults(config, {
    settings: {},
    gateway: {
      enabled: service.apiModulePath && true,
    },
    container: {
      enabled: false,
    },
  });
}
