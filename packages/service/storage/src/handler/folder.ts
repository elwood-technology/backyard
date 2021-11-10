import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';
import debug from 'debug';

import type { StorageNode } from '../types';
import { getBucket } from '../library/get-bucket';
import { getCredentials } from '../library/get-credentials';
import { getProvider } from '../library/get-provider';
import { hasAccess, getBucketAccess } from '../library/access';
import { normalizeFolderPath, normalizePath } from '../library/normalize-path';

type Next = () => void;
type Options = {};

const log = debug('by:handler:folder');

export default function fastifyHandleFolder(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const { '*': rawPath = '/', bucket: id } = req.params as {
      bucket?: string;
      '*'?: string;
    };
    const path = normalizeFolderPath(rawPath);

    log('path %s', path);

    if (!id) {
      const resp: { nodes: StorageNode[] } = {
        nodes: (await getBucketAccess(req)).map((bucket) => {
          return {
            type: 'folder',
            bucket: bucket.id,
            display_name: bucket.display_name,
            path: '/',
          };
        }),
      };

      log('found %i nodes', resp.nodes.length);

      return reply.send(resp);
    }

    const bucket = getBucket(id, app.state);
    const provider = getProvider(bucket, app.state);
    const credentials = getCredentials(bucket, app.state);

    invariant(credentials, 'Credentials not found');

    const nodes: StorageNode[] = [];
    const results = await provider.list({
      credentials,
      bucket,
      path,
    });

    for (const node of results.nodes) {
      log('found node %s', node.path);

      if (
        await hasAccess({
          req,
          bucket,
          path: normalizePath(node.type, node.path),
          type: node.type,
        })
      ) {
        nodes.push(node);
      }
    }

    log('found total nodes %i', nodes.length);

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
