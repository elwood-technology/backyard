import { relative, join, dirname } from 'path';

import { ContextModeLocal } from '@backyard/common';
import type {
  ConfigurationService,
  Context,
  ContextService,
} from '@backyard/types';

import type { NodeBootDevServerArgs } from './types';

const appRoot = '/var/app';

export async function config(
  context: Context,
  config: ConfigurationService,
): Promise<Partial<ConfigurationService>> {
  const rel = relative(context.dir.root, context.dir.stage);
  const _cwd = relative(context.dir.root, context.dir.cwd);

  const { port = 3000 } = config.settings ?? {};

  return {
    gateway: {
      enabled: true,
    },
    container: {
      enabled: true,
      imageName: 'node',
      port: 3000,
      externalPort: port,
      host:
        context.mode === ContextModeLocal ? config.container?.name : '0.0.0.0',
      environment: {},
      meta: {
        dockerCompose: {
          command: ['node', 'index.js'],
          volumes: [`${context.dir.root}:${appRoot}`],
          working_dir: `${appRoot}/${rel}/${config.name}`,
        },
      },
    },
  };
}

export async function stage(
  dir: string,
  context: Context,
  service: ContextService,
): Promise<void> {
  const rel = relative(context.dir.root, service.apiModulePath as string);
  const { filesystem } = context.tools;

  const args = JSON.stringify({
    handlerPath: join(appRoot, rel),
    watchPaths: [join(appRoot, dirname(rel))],
  } as NodeBootDevServerArgs);

  await filesystem.writeAsync(
    join(dir, 'index.js'),
    `require('@backyard/platform-node/dev-server').boot(${args})`,
  );
}
