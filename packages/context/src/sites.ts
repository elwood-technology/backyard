import { dirname } from 'path';

import { filesystem } from 'gluegun';
import findUp from 'find-up';

import type {
  Configuration,
  ConfigurationSite,
  ContextSitesMap,
  ContextSite,
} from '@backyard/types';

import { requireModule } from '@backyard/common';

export async function loadSite(
  cwd: string,
  config: ConfigurationSite,
  port: number,
): Promise<ContextSite> {
  const pkgFile = await findUp('package.json', {
    cwd,
  });

  if (!pkgFile) {
    throw new Error('bad root module');
  }
  const moduleRootPath = dirname(pkgFile);

  return {
    config,
    name: config.name,
    moduleRootPath,
    port,
  };
}

export async function createSitesMap(
  configuration: Configuration,
  sourceDir: string,
  devServerPort: number,
): Promise<ContextSitesMap> {
  const sitesMap = new Map<string, ContextSite>();

  if (filesystem.exists(sourceDir)) {
    const sitesFiles = await filesystem.findAsync(sourceDir, {
      matching: '**/backyard-site.*',
    });

    await Promise.all(
      sitesFiles.map(async (file, i) => {
        const config = requireModule(file) as ConfigurationSite;
        sitesMap.set(
          config.name,
          await loadSite(file, config, devServerPort + i + 1),
        );
      }),
    );
  }

  configuration.sites?.forEach((config) => {
    return {
      name: config.name,
      config,
    };
  });

  return sitesMap;
}
