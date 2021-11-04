import fastify from 'fastify';

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

export default app;
