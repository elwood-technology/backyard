import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import type { StorageNode } from '../types';
import { getBucket, getCredentials, getProvider } from '../utils';

type Next = () => void;
type Options = {};

export default function fastifyState(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const { '*': path = '/', bucket: id } = req.params as {
      bucket?: string;
      '*'?: string;
    };

    if (!id) {
      console.log(app.state.buckets);

      const resp: { nodes: StorageNode[] } = {
        nodes: app.state.buckets.map((item) => {
          return {
            type: 'folder',
            bucket_id: item.id,
            display_name: item.displayName,
            path: '/',
          };
        }),
      };

      return reply.send(resp);
    }

    const bucket = getBucket(id, app.state);
    const provider = getProvider(bucket);
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
    url: '/folder',
    handler,
  });

  app.route({
    method: 'GET',
    url: '/folder/:bucket/*?',
    handler,
  });

  next();
}
