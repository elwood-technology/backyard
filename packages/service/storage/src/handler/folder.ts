import { join } from 'path';

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import { StorageProvider } from '../types';
import { getCredentials } from '../utils';

type Next = () => void;
type Options = {};

export default function fastifyState(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  function getProvider(name: string): StorageProvider {
    return require(join(__dirname, '../provider', name)) as StorageProvider;
  }

  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const {
      provider: providerName,
      '*': path,
      bucket,
    } = req.params as {
      provider: string;
      bucket: string;
      '*': string;
    };

    const provider = getProvider(providerName);
    const credentials = getCredentials(bucket, app.state);

    invariant(credentials, 'Credentials not found');

    const { nodes } = await provider.list({
      credentials,
      bucket,
      path,
    });

    // const client = await app.pg.connect();

    // const { rows } = await client.query(
    //   'SELECT "n"."service" FROM "zuul"."nodes" as "n" WHERE "user_id" = $1 GROUP BY "n"."service"',
    //   [getUser(req).sub],
    // );

    reply.send({
      nodes,
    });
  }

  app.route({
    method: 'GET',
    url: '/folder/:provider/:bucket/*?',
    handler,
  });

  next();
}
