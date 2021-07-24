import { relative } from 'path';

import type { Context } from '@backyard/types';

import { DockerComposeService, KongService } from '../types';

import { kongService } from './kong';

export function devServerDockerCompose(state: Context): DockerComposeService {
  const rel = relative(state.dir.root, state.dir.dest);
  const cwd = relative(state.dir.root, state.dir.cwd);
  const port = state.coreServiceSettings.devServer?.port ?? 3000;
  const sites = Array.from(state.sitesMap.values());

  const ports = [
    `${port}:${port}`,
    ...sites.map((item) => {
      return `${item.port}:${item.port}`;
    }),
  ];

  return {
    container_name: 'by-dev-server',
    image: 'node',
    ports,
    volumes: [`${state.dir.root}:/var/app`],
    working_dir: `/var/app/${rel}/dev-server`,
    command: ['node', 'server.js', `/var/app/${cwd}`],
  };
}

export function devServerKongServices(state: Context): KongService[] {
  const { containerHost, containerPort } = state.coreServiceSettings
    .devServer || {
    containerHost: 'devServer',
    containerPort: 3000,
  };

  return Array.from(state.userServices.values()).map((item) => {
    return kongService({
      name: item.name,
      version: item.config.version,
      url: `http://${containerHost}:${containerPort}/`,
    });
  });
}
