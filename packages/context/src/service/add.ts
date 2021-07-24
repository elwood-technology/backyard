import type { Context, ConfigurationService } from '@backyard/types';
import { invariant } from '@backyard/common';

import { Service } from './service';

export async function addServiceToContext(
  context: Context,
  config: ConfigurationService,
  tryToInitialize = false,
): Promise<void> {
  const map = context.services;

  if (map.has(config.name)) {
    context.log(`Service "${config.name}" already exists`);
    return;
  }

  invariant(config.provider, 'Service must have a provider');

  const service = new Service(config);
  service.setContext(context);

  await service.load();

  if (tryToInitialize) {
    await service.init();
    await service.finalize();
  }

  map.set(config.name, service);
}
