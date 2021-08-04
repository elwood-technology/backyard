import { join } from 'path';

import { stringify as yaml } from 'yaml';

import { debug } from '@backyard/common';
import type {
  ConfigurationServiceContainer,
  ContextService,
  JsonObject,
} from '@backyard/types';

const log = debug('backyard:platform:docker:compose');

export function createDockerCompose(
  stageDir: string,
  services: ContextService[],
): string {
  return yaml({
    version: '3.6',
    services: services.reduce((current, service) => {
      if (!service.container || service.container?.enabled === false) {
        log(
          `skipping service "${service.name}" because container is not enabled`,
        );
        return current;
      }

      log(`adding service "${service.name}"`);

      const serviceDir = join(stageDir, service.name);
      const container = service.container || {};
      const more = container?.meta?.dockerCompose || {};

      return {
        ...current,
        [service.name]: {
          ...imageName(container),
          ...createVolumes(
            container.volumes?.map((v) => [join(serviceDir, v[0]), v[1]]),
          ),
          container_name: container.name ?? `by-${service.name}`,
          environment: container.environment ?? {},
          ...more,
          ports: createPorts(container),
        },
      };
    }, {}),
  });
}

function imageName(config: ConfigurationServiceContainer): JsonObject {
  if (config.imageName) {
    return {
      image: config.imageName,
    };
  }

  if (config.build) {
    return {
      build: config.build,
    };
  }

  return {};
}

function createPorts(config: ConfigurationServiceContainer): string[] {
  const morePorts = config.meta?.dockerCompose?.ports ?? [];

  if (!config.externalPort) {
    return morePorts;
  }

  return [[config.externalPort, config.port].join(':'), ...morePorts];
}

function createVolumes(volumes: Array<[string, string]> = []): JsonObject {
  if (volumes.length === 0) {
    return {};
  }

  return { volumes: volumes.map((v) => v.join(':')) };
}
