import type { Context, ConfigurationService } from '@backyard/types';

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
      environment: {
        SERVICE_KEY: '<%= context.keys.service %>',
        AUTH_URL: '<%= context.serviceInternalUrl("auth") %>',
        STORE_URL: '<%= context.serviceInternalUrl("store") %>',
      },
    },
  };
}
