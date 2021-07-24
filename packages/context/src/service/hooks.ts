import { filesystem } from 'gluegun';

import type { ServiceStageProvider, ServiceHooks } from '@backyard/types';

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
  const { config, stage, init, ...hooks } = requireModule(modulePath) as {
    config?: ServiceHooks['config'];
    init?: ServiceHooks['init'];
    stage?: ServiceStageProvider;
  };

  return {
    config,
    init,
    stage,
    hooks: hooks as ServiceHooks['hooks'],
  };
}
