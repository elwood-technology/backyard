import fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';
import fastifyJtw from 'fastify-jwt';

import registerServices from './handler/services';

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

app.register(fastifyPostgres, {
  connectionString: process.env.POSTGRES_URI,
});

app.register(fastifyJtw, {
  secret: String(process.env.JWT_SECRET),
});

registerServices(app);

export default app;
