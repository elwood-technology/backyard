import { dirname } from 'path';

import { filesystem } from 'gluegun';
import findUp from 'find-up';

import type {
  Configuration,
  ConfigurationService,
  ContextCoreServicesSettingsMap,
  ContextService,
  CoreServiceName,
  ContextUserServicesMap,
} from '@backyard/types';

import { requireModule } from '@backyard/common';

export const coreServices: CoreServiceName[] = [
  'auth',
  'kong',
  'db',
  'rest',
  'storage',
  'devServer',
];

export async function loadService<S extends ContextService = ContextService>(
  cwd: string,
  config: ConfigurationService,
  type: ContextService['type'],
): Promise<S> {
  const pkgFile = await findUp('package.json', {
    cwd,
  });

  if (!pkgFile) {
    throw new Error('bad root module');
  }
  const moduleRootPath = dirname(pkgFile);

  const apiModulePath = filesystem
    .find(moduleRootPath, {
      matching: 'backyard-api.*',
    })
    ?.shift();

  const uiModulePath = filesystem
    .find(moduleRootPath, {
      matching: 'backyard-ui.*',
    })
    ?.shift();

  return {
    config,
    name: config.name,
    type,
    moduleRootPath,
    apiModulePath,
    uiModulePath,
  } as S;
}

export async function buildUserServicesMap(
  configuration: Configuration,
  sourceDir: string,
): Promise<ContextUserServicesMap> {
  const userServicesMap: ContextUserServicesMap = new Map<
    string,
    ContextService
  >();

  if (filesystem.exists(sourceDir)) {
    const serviceFiles = await filesystem.findAsync(sourceDir, {
      matching: '**/backyard-service.*',
    });

    await Promise.all(
      serviceFiles.map(async (file) => {
        const config = requireModule(file) as ConfigurationService;

        if (coreServices.includes(config.name as CoreServiceName)) {
          return;
        }

        userServicesMap.set(
          config.name,
          await loadService(file, config, 'local'),
        );
      }),
    );
  }

  await Promise.all(
    (configuration.services ?? []).map(async (config) => {
      if (coreServices.includes(config.name as CoreServiceName)) {
        return;
      }

      const c = config as ConfigurationService;

      userServicesMap.set(
        config.name,
        await loadService(require.resolve(c.provider), c, 'package'),
      );
    }),
  );

  return userServicesMap;
}

export async function buildCoreServicesSettingsMap(
  configuration: Configuration,
  defaultSettings: ContextCoreServicesSettingsMap,
): Promise<ContextCoreServicesSettingsMap> {
  const coreServicesMap = { ...defaultSettings };

  for (const name of coreServices) {
    const config = configuration.services?.find((item) => item.name === name);

    if (config) {
      (coreServicesMap[name] as unknown) = {
        ...defaultSettings[name],
        ...config.settings,
      };
    }
  }

  return coreServicesMap;
}
