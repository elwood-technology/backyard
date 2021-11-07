import { existsSync } from 'fs';

import fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';
import fastifyJtw from 'fastify-jwt';

import registerNodes from './handler/folder';
import invariant from 'ts-invariant';
import { StorageState } from '.';

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

app.addContentTypeParser(
  'application/vnd.git-lfs+json',
  { parseAs: 'string' },
  app.getDefaultJsonParser('ignore', 'ignore'),
);

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
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.decorate('state', require(STORAGE_STATE_FILE) as StorageState);

app.register(fastifyPostgres, {
  connectionString: process.env.POSTGRES_URI,
});

app.register(fastifyJtw, {
  secret: String(process.env.JWT_SECRET),
});

app.register(registerNodes, {});

export default app;
