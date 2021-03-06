import { isAbsolute, resolve } from 'path';

import { filesystem } from 'gluegun';

import type {
  ConfigurationService,
  Configuration,
  FullConfiguration,
  ConfigurationServiceProviderOptions,
} from '@backyard/types';
import {
  requireModule,
  silentResolve,
  normalizeModuleDef,
} from '@backyard/common';

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
  sourceDir: string | undefined,
): Promise<ConfigurationService[]> {
  if (!sourceDir) {
    return [];
  }

  if (!filesystem.exists(sourceDir)) {
    return [];
  }

  const serviceFiles = await filesystem.cwd(sourceDir).findAsync('', {
    matching: [
      '**/backyard-service.*',
      '!**/node_modules/**',
      '!node_modules/**',
    ],
  });

  return await Promise.all(
    serviceFiles.map(async (fileName) => {
      const file = resolve(sourceDir, fileName);

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

export function resolveProvider(
  config: FullConfiguration,
  provider: ConfigurationService['provider'],
): [string, ConfigurationServiceProviderOptions] | undefined {
  if (!provider) {
    return undefined;
  }

  const [module, options] = normalizeModuleDef(provider);

  if (isAbsolute(module)) {
    return [module, options];
  }

  if (silentResolve(module)) {
    return [require.resolve(module), options];
  }

  const root = config._configFileRoot ?? process.cwd();

  return [resolve(root, module), options];
}
