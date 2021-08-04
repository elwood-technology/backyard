import { join } from 'path';

import type {
  Context,
  ConfigurationService,
  ServiceHookProviderArgs,
} from '@backyard/types';
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
        SERVICE_KEY:
          '<%= await context.getService("gateway").hook("serviceKey") %>',
        AUTH_URL: '<%= context.getService("auth").getContainerUrl() %>',
        STORE_URL: '<%= context.getService("api").getContainerUrl() %>',
      },
    },
  };
}
export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  const { dir, context } = args;
  const { filesystem } = context.tools;

  filesystem.writeAsync(join(dir, 'state.json'), {
    services: getServices(context).map((item) => {
      return {
        name: item.name,
        url: context.getService(item.name).getGatewayUrl(),
        ui: !!item.uiModulePath,
        api: !!item.apiModulePath,
      };
    }),
  });
}
