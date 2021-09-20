import { relative } from 'path';

import { ConfigurationService, Context } from '@backyard/types';
import { ContextModeRemote, invariant } from '@backyard/common';

import { NextJsServiceSettings } from './types';
import { getSourceDir } from './util';

export { stage } from './stage';

export function config(
  context: Context,
  config: ConfigurationService<NextJsServiceSettings>,
): Partial<ConfigurationService> {
  const { filesystem } = context.tools;

  invariant(config.settings?.src, 'Must provide settings.src');

  const srcDir = getSourceDir(context, config.settings.src);

  invariant(
    filesystem.exists(srcDir),
    `[services.${config.name}] Provided source directory "${srcDir}" does not exist.`,
  );

  const prefix = config.name ?? 'web';
  const relDir = relative(context.dir.root, config.settings?.src);

  return {
    settings: {},
    gateway: {
      prefix,
      enabled: true,
      stripPath: true,
      urlPath: '/api',
    },
    container: {
      imageName: 'node',
      enabled: true,
      port: 3000,
      host: context.mode === ContextModeRemote ? '0.0.0.0' : config.name,
      externalPort: context.mode === ContextModeRemote ? 80 : 8080,
      volumes: [[context.dir.root, '/app/src']],
      environment: {
        NODE_ENV:
          context.mode === ContextModeRemote ? 'production' : 'development',
      },

      meta: {
        dockerCompose: {
          command: ['yarn', 'dev'],
          working_dir: `/app/src/${relDir}`,
        },
      },
    },
  };
}
