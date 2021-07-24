import nodemon from 'nodemon';

import type { ConfigurationServiceDevServerSettings } from '@backyard/types';

import { createServer } from './server';
import { startSites } from './sites';

const childEnvName = 'BY_DEV_SERVER_CHILD';

export type StartServerArgs = {
  cwd: string;
  keys?: {
    anon: string;
    service: string;
  };
};

export async function createAndStart(port: number | string): Promise<void> {
  const server = await createServer();
  server.listen(port);
}

export async function startServer(
  { cwd }: StartServerArgs,
  config: ConfigurationServiceDevServerSettings = {},
): Promise<void> {
  const { port = 3000, watch = false, sites = true, watchPaths } = config;

  if (sites !== false) {
    await startSites(cwd);
  }

  if (watch !== true) {
    await createAndStart(port);
    return;
  }

  nodemon({
    script: __filename,
    ext: 'js json ts tsx',
    watch: watchPaths,
    env: {
      [childEnvName]: 'true',
      NODE_PORT: String(port),
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  });

  nodemon
    .on('stdout', (data) => {
      console.log(`[dev-server] ${data.toString()}`);
    })
    .on('stderr', (data) => {
      console.log(`[dev-server] ${data.toString()}`);
    })
    .on('log', ({ message }) => {
      console.log(`[dev-server] ${message.toString()}`);
    })
    .on('start', () => {
      console.log('[dev-server] started in watch mode...');
    })
    .on('restart', () => {
      console.log('[dev-server] restarting....');
    })
    .on('quit', () => {
      console.log('[dev-server] quit');
      process.exit();
    });
}

if (process.env[childEnvName] === 'true') {
  createAndStart(process.env.NODE_PORT || 3000)
    .then()
    .catch((err) => {
      console.log('[dev-server] unabl;e to start watch process');
      console.log(`[dev-server] Error: ${err.message}`);
      process.exit();
    });
}
