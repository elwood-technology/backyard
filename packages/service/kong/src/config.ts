import type { Context, ContextService, JsonObject } from '@backyard/types';
import { ContextModeLocal, getServices, invariant } from '@backyard/common';

import { KongConfig, KongContextService, KongService } from './types';

import { keys } from './service';

export function shouldEnableService(
  context: Context,
  service: ContextService,
): boolean {
  const gateway = service.gateway;

  if (gateway === undefined || gateway?.enabled === false) {
    return false;
  }

  if (context.mode === ContextModeLocal && service.name === 'dev-server') {
    return false;
  }

  return true;
}

export async function createKongConfig(
  context: Context,
  service: KongContextService,
): Promise<KongConfig> {
  const key = await keys({ context, service });
  const { routePrefix = '' } = service.settings;

  const coreServices = await Promise.all(
    getServices(context).map(async (service) => {
      const gateway = service.gateway;

      if (!shouldEnableService(context, service)) {
        return;
      }

      invariant(gateway, 'Gateway is not defined');

      const prefix = service.gateway?.prefix ?? service.name;
      const version = 1;
      const stripPath = gateway.stripPath ?? true;
      const routes = gateway.routes ?? [
        {
          name: `${prefix}-all`,
          strip_path: stripPath,
          paths: [`/${routePrefix}${prefix}/v${version}`],
        },
      ];

      const container = service.container;
      const host = container?.host ?? service.name;
      const port = container?.port ?? 3000;

      return {
        name: service.name,
        _comment: `Gateway for ${service.name}`,
        url: service.gateway?.url ?? `http://${host}:${port}`,
        routes,
        plugins: [
          ...(gateway?.plugins || []),
          { name: 'cors' },
          { name: 'key-auth', config: { hide_credentials: true } },
        ],
      };
    }),
  );

  return {
    _format_version: '1.1',
    ...createKingCertificates(context),
    services: [
      ...coreServices,
      {
        name: 'health',
        _comment: 'Health',
        url: 'http://localhost:8000/',
        routes: [
          {
            name: 'health-all',
            strip_path: true,
            paths: [`/${routePrefix}health`],
          },
        ],
        plugins: [
          {
            name: 'request-termination',
            config: {
              status_code: 200,
              message: 'awesome :)',
            },
          },
        ],
      },
    ].filter(Boolean) as KongService[],
    consumers: [
      {
        username: 'anon-key',
        keyauth_credentials: [
          {
            key: key.anonymousKey,
          },
        ],
      },
      {
        username: 'service-key',
        keyauth_credentials: [
          {
            key: key.serviceKey,
          },
        ],
      },
    ],
  };
}

export function createKingCertificates(context: Context): JsonObject {
  if (!context.settings.certPath || !context.settings.certKeyPath) {
    return {};
  }

  return {
    certificates: [
      {
        cert: context.tools.filesystem.read(context.settings.certPath),
        key: context.tools.filesystem.read(context.settings.certKeyPath),
        snis: [{ name: 'localhost' }],
      },
    ],
  };
}
