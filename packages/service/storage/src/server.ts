import { join } from 'path';

import { config } from 'dotenv';
import { FastifyInstance } from 'fastify';

config({
  path: join(__dirname, '../.env'),
});

const port = process.env.NODE_PORT ?? 3000;

(require('./app').default as FastifyInstance).listen(port, '0.0.0.0', (err) => {
  console.log('listening... maybe');
  err && console.log(err);
});
