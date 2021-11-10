import { join, basename } from 'path';

import { invariant, ContextModeLocal } from '@backyard/common';
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
      build: {
        context: join(context.dir.stage, config.name ?? ''),
      },
      volumes: [[context.dir.root, '/var/app']],
      environment: {
        NODE_PATH: '/var/app/node_modules',
        NODE_ENV:
          ContextModeLocal === context.mode ? 'development' : 'production',
        POSTGRES_URI: `<%= await context.getService("${config.settings.db}").hook("uri") %>`,
        JWT_SECRET:
          '<%= await context.getService("gateway").hook("jwtSecret") %>',
      },
      meta: {
        dockerCompose: {},
      },
    },
  };
}

export async function sql(
  args: ServiceHookProviderArgs,
): Promise<Array<string[]>> {
  const { context } = args;

  const sql = await context.tools.filesystem.findAsync(
    join(__dirname, '../sql'),
    {
      matching: ['**/*.sql', '!*.local.sql'],
    },
  );

  return sql.map((file) => {
    return [basename(file), String(context.tools.filesystem.read(file))];
  });
}

export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  await args.context.tools.filesystem.copyAsync(
    join(__dirname, '../Dockerfile'),
    join(args.dir, './Dockerfile'),
  );

  await args.context.tools.filesystem.writeAsync(
    join(args.dir, './server.js'),
    `require('@backyard/service-storage/server')`,
  );

  const stateFileContent = args.service.settings.stateFile
    ? (args.context.tools.filesystem.read(
        args.service.settings.stateFile,
      ) as string)
    : 'module.exports = {}';

  await args.context.tools.filesystem.writeAsync(
    join(args.dir, 'state.js'),
    stateFileContent,
  );
}
