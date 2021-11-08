import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import type { StorageNode } from '../types';
import { getBucket } from '../utils/get-bucket';
import { getCredentials } from '../utils/get-credentials';
import { getProvider } from '../utils/get-provider';
import { getUser } from '../utils/get-user';
import { hasAccess, getBucketAccess } from '../utils/access';

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
        nodes: (await getBucketAccess(app)).map((bucket) => {
          return {
            type: 'folder',
            bucket: bucket.id,
            display_name: bucket.display_name,
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

    const nodes: StorageNode[] = [];
    const results = await provider.list({
      credentials,
      bucket,
      path,
    });

    for (const node of results.nodes) {
      if (
        await hasAccess({
          app,
          userId,
          bucket,
          path: node.path,
          type: node.type,
        })
      ) {
        nodes.push(node);
      }
    }

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
