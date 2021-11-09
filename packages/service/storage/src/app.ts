import { existsSync } from 'fs';

import fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';
import fastifyJtw from 'fastify-jwt';

import invariant from 'ts-invariant';

import registerFolderHandle from './handler/folder';
import registerFileHandler from './handler/file';
import registerAccessHandler from './handler/access';

import registerSyncBucketsPlugin from './plugins/sync-buckets';

import type { StorageState } from './types';

const { STORAGE_STATE_FILE } = process.env;

invariant(STORAGE_STATE_FILE, 'STORAGE_STATE_FILE is required');
invariant(
  existsSync(STORAGE_STATE_FILE),
  `STORAGE_STATE_FILE ${STORAGE_STATE_FILE} does not exist`,
);

const app = fastify({
  ignoreTrailingSlash: true,
  logger: false,
});

app.addContentTypeParser('*', function (_request, payload, done) {
  var data = '';
  payload.on('data', (chunk) => {
    data += chunk;
  });
  payload.on('end', () => {
    done(null, data);
  });
});

app.addHook('onRequest', async (req, reply) => {
  try {
    req.client = await app.pg.connect();
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.addHook('onResponse', async (req) => {
  req.client.release();
});

app.decorate('state', require(STORAGE_STATE_FILE) as StorageState);

app.register(fastifyPostgres, {
  connectionString: process.env.POSTGRES_URI,
});

app.register(fastifyJtw, {
  secret: String(process.env.JWT_SECRET),
});

app.register(registerSyncBucketsPlugin, {});

app.register(registerFileHandler, {});
app.register(registerFolderHandle, {});
app.register(registerAccessHandler, {});

export default app;
