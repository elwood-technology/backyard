import { join } from 'path';

import type { Context, ConfigurationService } from '@backyard/types';
import { getServices } from '@backyard/common';

export async function config(
  _context: Context,
): Promise<Partial<ConfigurationService>> {
  return {
    platform: '@backyard/platform-node',
    gateway: {
      enabled: true,
    },
    container: {
      enabled: true,
      port: 3000,
      externalPort: 9990,
      environment: {
        SERVICE_KEY: '<%= context.keys.service %>',
        AUTH_URL: '<%= context.serviceInternalUrl("auth") %>',
        STORE_URL: '<%= context.serviceInternalUrl("store") %>',
      },
    },
  };
}
export async function stage(dir: string, context: Context): Promise<void> {
  const { filesystem } = context.tools;

  filesystem.writeAsync(join(dir, 'state.json'), {
    services: getServices(context).map((item) => {
      return {
        name: item.name,
        url: context.serviceExternalUrl(item.name),
        ui: !!item.uiModulePath,
        api: !!item.apiModulePath,
      };
    }),
  });
}
