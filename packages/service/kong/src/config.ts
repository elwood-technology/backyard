import type {
  Context,
  ContextService,
  JsonObject,
  ConfigurationServiceGateway,
} from '@backyard/types';
import { getServices, invariant, debug } from '@backyard/common';

import { KongConfig, KongContextService, KongService } from './types';

import { keys } from './service';

const log = debug('backyard:service:kong:config');

type Gateway = [ContextService, ConfigurationServiceGateway];

export async function createKongConfig(
  context: Context,
  kongService: KongContextService,
): Promise<KongConfig> {
  const key = await keys({ context, service: kongService });
  const { routePrefix = '' } = kongService.settings;
  const gateways: Gateway[] = [];

  for (const service of getServices(context)) {
    if (service.gateway) {
      const { additional, ...defaultGateway } = service.gateway;

      if (additional) {
        gateways.push(...additional.map((item) => [service, item] as Gateway));
      }

      gateways.push([service, defaultGateway]);
    }
  }

  const coreServices = await Promise.all(
    gateways.map(async ([service, gateway]) => {
      if (gateway.enabled === false) {
        return;
      }

      log(`gateway service "${service.name}"`);

      invariant(gateway, 'Gateway is not defined');

      const prefix = gateway?.prefix ?? service.name;
      const version = 1;
      const stripPath = gateway.stripPath ?? true;
      const routes = gateway.routes ?? [
        {
          name: `${prefix}-all`,
          strip_path: stripPath,
          paths: [`${prefix}/v${version}`],
        },
      ];

      const container = service.container;
      const host = container?.host ?? service.name;
      const port = container?.port ?? 3000;
      const urlPath = gateway.urlPath ?? '';

      return {
        name: gateway.gatewayName ?? service.name,
        _comment: `Gateway for ${service.name}`,
        url: gateway?.url ?? `http://${host}:${port}${urlPath}`,
        routes: routes.map((route) => ({
          ...route,
          paths: route.paths.map(
            (path) => `/${routePrefix}${path.replace(/^\//, '')}`,
          ),
        })),
        plugins: gateway?.plugins ?? [
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
