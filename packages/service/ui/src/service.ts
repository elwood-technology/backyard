import { join, relative } from 'path';

import { AbstractService, getServices } from '@backyard/common';
import type {
  ConfigurationService,
  Context,
  ContextService,
} from '@backyard/types';
import { config as nodeConfig } from '@backyard/platform-node';

export function getServicesWithUi(context: Context): ContextService[] {
  return getServices(context).filter((item) => {
    return item.uiModulePath;
  });
}

export class UiService extends AbstractService {
  async config(context: Context, config: ConfigurationService) {
    const { container } = await nodeConfig(context, config);

    const ports = getServicesWithUi(context).map((_, index) => {
      return [8081 + index, 8081 + index].join(':');
    });

    return {
      gateway: {
        enabled: false,
      },
      container: {
        ...container,
        externalPort: 8080,
        externalHost: 'localhost',
        port: 8080,
        meta: {
          dockerCompose: {
            ...(container?.meta?.dockerCompose ?? {}),
            ports,
          },
        },
      },
      dependencies: ['db', 'api', 'auth', 'authz'],
    };
  }

  stage = async (dir: string, context: Context) => {
    const fs = this.filesystem(context);

    const modules = getServices(context)
      .filter((item) => {
        return item.uiModulePath;
      })
      .map((item, index) => {
        return {
          name: item.name,
          port: 8081 + index,
          entry: `./${relative(context.dir.root, item.uiModulePath!)}`,
        };
      });

    for (const mod of modules) {
      await fs.writeAsync(
        join(dir, mod.name, 'webpack.config.js'),
        `module.exports = require('@backyard/service-ui').createWebpackConfig("${mod.entry}")`,
      );
    }

    const state = JSON.stringify({
      mode: context.mode === 'local' ? 'development' : 'production',
      gatewayBaseUrl: context.getService('gateway').getGatewayUrl(),
      apiAnonKey: await context.getService('gateway').hook('anonymousKey'),
      webpackContextPath: `/var/app`,
      modules,
    });

    await fs.writeAsync(
      join(dir, 'index.js'),
      `require('@backyard/service-ui/server').boot(${state})`,
    );
  };
}

export default new UiService();
