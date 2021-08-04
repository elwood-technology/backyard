import { isAbsolute, resolve } from 'path';

import { filesystem } from 'gluegun';

import type {
  ConfigurationService,
  Configuration,
  FullConfiguration,
} from '@backyard/types';
import { requireModule, silentResolve } from '@backyard/common';

import { coreServiceProviders } from '../core-services';

export function normalizeServices(
  services: ConfigurationService[] = [],
): ConfigurationService[] {
  if (!services || services?.length === 0) {
    return normalizeServices(
      Object.keys(coreServiceProviders).map((name) => ({
        name,
      })),
    );
  }

  const hasServiceNames = services.map((item) => item.name);

  Object.keys(coreServiceProviders).forEach((name) => {
    if (!hasServiceNames.includes(name)) {
      services.push({
        name,
      });
    }
  });

  const result = services.map((item) => {
    if (item.name! in coreServiceProviders) {
      return {
        provider: coreServiceProviders[item.name!],
        ...item,
      };
    }

    return item;
  });

  return result;
}

export async function readCoreServicesFromConfiguration(
  configuration: Configuration,
): Promise<ConfigurationService[]> {
  const configServices = normalizeServices(configuration.services || []);

  return configServices
    .filter((service) => {
      return Object.keys(coreServiceProviders).includes(service.name!);
    })
    .map((item) => ({
      provider: coreServiceProviders[item.name!],
      type: 'core',
      enabled: true,
      ...item,
    }));
}

export async function readServicesFromSource(
  sourceDir: string,
): Promise<ConfigurationService[]> {
  if (!filesystem.exists(sourceDir)) {
    return [];
  }

  const serviceFiles = await filesystem.findAsync(sourceDir, {
    matching: [
      '**/backyard-service.*',
      '!**/node_modules/**',
      '!node_modules/**',
    ],
  });

  return await Promise.all(
    serviceFiles.map(async (file) => {
      return {
        ...(requireModule(file) as ConfigurationService),
        type: 'src',
        provider: resolve(sourceDir, file),
      };
    }),
  );
}

export async function readUsersServicesFromConfiguration(
  configuration: Configuration,
): Promise<ConfigurationService[]> {
  const configServices = configuration.services || [];

  return configServices
    .filter((service) => {
      return !Object.keys(coreServiceProviders).includes(service.name!);
    })
    .map((item) => {
      return {
        ...item,
        provider: resolveProvider(
          configuration as FullConfiguration,
          item.provider,
        ),
        type: 'user',
      };
    });
}

function resolveProvider(
  config: FullConfiguration,
  provider: string | undefined,
): string | undefined {
  if (!provider) {
    return undefined;
  }

  if (isAbsolute(provider)) {
    return provider;
  }

  if (silentResolve(provider)) {
    return require.resolve(provider);
  }

  const root = config._configFileRoot ?? process.cwd();

  return resolve(root, provider);
}
