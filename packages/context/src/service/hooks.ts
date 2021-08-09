import { filesystem } from 'gluegun';

import type {
  Json,
  ContextService,
  JsonObject,
  ServiceHooks,
} from '@backyard/types';

import { requireModule, isFunction } from '@backyard/common';

export async function loadServicesModuleHooks(
  moduleRootPath: string,
): Promise<ServiceHooks> {
  const serviceModulePath = filesystem
    .find(moduleRootPath, {
      matching: 'backyard-service.*',
    })
    ?.shift();

  if (!serviceModulePath) {
    return {};
  }

  return loadServicesModuleHooksFromFile(serviceModulePath);
}

export function loadServicesModuleHooksFromFile(
  modulePath: string,
): ServiceHooks {
  const { config, init, ...hooks } = requireModule(modulePath) as ServiceHooks;

  return {
    config,
    init,
    stage: hooks.stage,
    hooks: hooks as ServiceHooks['hooks'],
  };
}

export async function executeServiceHook<Result = Json>(
  service: ContextService,
  name: string,
  args: JsonObject,
): Promise<Result> {
  let result: Json = undefined;

  const hooks = service.getHooks().hooks;
  const platformHooks = service.getPlatform().hooks;
  const context = service.getContext();

  await executeServiceHook(service, `before:${name}`, args);

  if (platformHooks && isFunction(platformHooks[name])) {
    result = await platformHooks[name]({
      context,
      service,
      ...args,
    });
  }

  if (hooks && isFunction(hooks[name])) {
    result = await hooks[name]({
      context,
      service,
      parent: result,
      ...args,
    });
  }

  await executeServiceHook(service, `after:${name}`, { ...args, result });

  return result as Result;
}
