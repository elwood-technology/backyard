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
  if (!filesystem.exists(moduleRootPath)) {
    throw new Error(`Module root path ${moduleRootPath} does not exist`);
  }

  if (filesystem.isFile(moduleRootPath)) {
    return loadServicesModuleHooksFromFile(moduleRootPath);
  }

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
  const hooks = requireModule(modulePath) as ServiceHooks;

  return {
    config: hooks.config,
    init: hooks.init,
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
  const extendedHooks = service.getExtendedHooks().hooks;
  const platformHooks = service.getPlatform();
  const context = service.getContext();
  const isAPrecedingHook =
    name.startsWith('before:') || name.startsWith('after:');

  if (!isAPrecedingHook) {
    await executeServiceHook(service, `before:${name}`, args);
  }

  if (platformHooks) {
    result = await platformHooks.executeHook(name, {
      context,
      service,
      ...args,
    });
  }

  if (extendedHooks && isFunction(extendedHooks[name])) {
    result = await extendedHooks[name]({
      context,
      service,
      parent: result,
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

  if (!isAPrecedingHook) {
    await executeServiceHook(service, `after:${name}`, { ...args, result });
  }

  return result as Result;
}
