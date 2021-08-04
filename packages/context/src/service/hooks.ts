import { filesystem } from 'gluegun';

import type { ServiceHooks } from '@backyard/types';

import { requireModule } from '@backyard/common';

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
