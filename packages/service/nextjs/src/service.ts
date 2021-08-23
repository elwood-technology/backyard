import { join } from 'path';

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

  const gateway = context.getService('gateway');
  const routePrefix = gateway.settings.routePrefix ?? '';
  const contextDir = join(
    context.dir.root,
    config.settings?.context ?? config.settings?.src,
  );

  return {
    settings: {},
    gateway: {
      prefix,
      enabled: true,
      stripPath: true,
      routes: [
        {
          name: `${prefix}-all`,
          strip_path: true,
          paths: [`/${routePrefix}${prefix}/v1/(?<rest>\\\S+)`],
        },
      ],
      plugins: [
        {
          name: 'request-transformer',
          config: {
            replace: {
              uri: `/api/$(uri_captures['rest'])`,
            },
          },
        },
      ],
    },
    container: {
      enabled: true,
      port: 3000,
      host: context.mode === ContextModeRemote ? '0.0.0.0' : config.name,
      externalPort: context.mode === ContextModeRemote ? 80 : 8080,
      volumes: [[contextDir, '/app/src']],
      environment: {
        NODE_ENV:
          context.mode === ContextModeRemote ? 'production' : 'development',
      },
      build: {
        dockerfile: join(context.dir.stage, `./${config.name}/Dockerfile`),
        context: contextDir,
      },
    },
  };
}
