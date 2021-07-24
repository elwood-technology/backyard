import nodemon from 'nodemon';

import type { ServiceHandler } from '@backyard/types';

import { appendServerMiddleware } from './middleware';
import { createServer } from './server';
import type { NodeBootDevServerArgs } from './types';

const childEnvName = 'BY_DEV_SERVER_CHILD';

export function boot(args: NodeBootDevServerArgs): void {
  const { handlerPath, watchPaths } = args;

  nodemon({
    script: __filename,
    ext: 'js json ts tsx',
    watch: [__dirname, ...watchPaths],
    cwd: process.cwd(),
    env: {
      [childEnvName]: 'true',
      HANDLER_PATH: handlerPath,
      NODE_PORT: String(3000),
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
  const { HANDLER_PATH } = process.env;

  if (!HANDLER_PATH) {
    console.log('[dev-server] No HANDLER_PATH in env');
    process.exit(1);
  }

  const { handler } = require(HANDLER_PATH) as { handler: ServiceHandler };

  createServer()
    .then(async (app) => {
      appendServerMiddleware(app, handler).listen(3000);
    })
    .catch((err) => {
      console.log('[dev-server] unable to start watch process');
      console.log(`[dev-server] Error: ${err.message}`);
      process.exit();
    });
}
