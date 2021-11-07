import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import type { StorageNode } from '../types';
import { getBucket, getCredentials, getProvider, getUser } from '../utils';
import { hasAccess } from '../access';

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
    const userId = getUser(req).sub;
    const { '*': path = '/', bucket: id } = req.params as {
      bucket?: string;
      '*'?: string;
    };

    if (!id) {
      const resp: { nodes: StorageNode[] } = {
        nodes: [],
      };

      for (const bucket of app.state.buckets) {
        if (
          await hasAccess({ app, userId, bucket, path: '/', type: 'folder' })
        ) {
          resp.nodes.push({
            type: 'folder',
            bucket: bucket.id,
            display_name: bucket.displayName,
            path: '/',
          });
        }
      }

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
