import { join, basename } from 'path';

import { ContextModeLocal, invariant } from '@backyard/common';
import type {
  ConfigurationService,
  Context,
  ServiceHookProviderArgs,
} from '@backyard/types';

export function config(
  context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  invariant(config.settings?.db, 'Missing settings.db');

  return {
    gateway: {
      enabled: true,
      stripPath: true,
    },
    container: {
      port: 3000,
      imageName: 'node',
      volumes: [[context.dir.root, '/var/app']],
      environment: {
        REST_URL: '<%= await context.getService("rest").getContainerUrl() %>',
        REST_SERVICE_KEY:
          '<%= await context.getService("gateway").hook("serviceKey") %>',
        TRAFFIC_BASE_URL:
          '<%= await context.getService("data").getGatewayUrl() %>',
        CALLBACK_URL: 'https://fe62-97-103-203-220.ngrok.io/api/messages/v1',
        TWILIO_ACCOUNT_SID: String(process.env.TWILIO_ACCOUNT_SID),
        TWILIO_AUTH_TOKEN: String(process.env.TWILIO_AUTH_TOKEN),
      },
      meta: {
        dockerCompose: {
          working_dir: '/var/app/packages/messages',
          command: ['yarn', 'dev'],
        },
      },
    },
  };
}

export async function sql(
  args: ServiceHookProviderArgs,
): Promise<Array<string[]>> {
  const { context } = args;

  const sql = await context.tools.filesystem.findAsync(
    join(__dirname, './sql'),
    {
      matching: '**/*.sql',
    },
  );

  return sql.map((file) => {
    return [basename(file), String(context.tools.filesystem.read(file))];
  });
}

export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  if (args.context.mode === ContextModeLocal) {
    await args.context.tools.filesystem.writeAsync(
      join(args.dir, './index.js'),
      `require('@backyard/service-storage/lib/server')`,
    );

    return;
  }
}
