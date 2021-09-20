import type { ConfigurationService, Context } from '@backyard/types';
import { invariant } from '@backyard/common';

export function config(
  _context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  invariant(
    config.settings?.db,
    'Must provide settings.db with name of Database service',
  );

  const port = String(config.container?.port ?? 4000);
  const host = config.container?.host ?? config.name ?? 'localhost';

  return {
    gateway: {
      enabled: true,
      url: `http://${host}:${port}/socket/`,
    },
    container: {
      enabled: true,
      essential: false,
      host: '0.0.0.0',
      port: 4000,
      imageName: 'supabase/realtime:latest',
      environment: {
        DB_HOST: `<%= await context.getService("${config.settings.db}").hook("host") %>`,
        DB_NAME: `<%= await context.getService("${config.settings.db}").hook("name") %>`,
        DB_USER: `<%= await context.getService("${config.settings.db}").hook("user") %>`,
        DB_PASSWORD: `<%= await context.getService("${config.settings.db}").hook("password") %>`,
        DB_PORT: `<%= await context.getService("${config.settings.db}").hook("port") %>`,
        PORT: String(config.container?.port ?? 4000),
        SECURE_CHANNELS: 'false',
        JWT_SECRET: `<%= await context.getService("gateway").hook("jwtSecret") %>`,
      },
      meta: {
        restart: 'on-failure',
        dockerCompose: {
          depends_on: [config.settings.db],
        },
      },
    },
  };
}
