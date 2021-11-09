import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import { md5 } from '../library/crypto';
import { getBucket } from '../library/get-bucket';
import { getCredentials } from '../library/get-credentials';
import { getProvider } from '../library/get-provider';
import { hasAccess } from '../library/access';
import {
  normalizeFilePath,
  normalizeFolderPath,
} from '../library/normalize-path';
import { dbProvider } from '../library/db';
import { getUser } from '../library/get-user';

type Next = () => void;
type Options = {};

export default function fastifyHandleAccess(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  app.addSchema({
    $id: 'https://backyard.io#/storage/access',
    type: 'object',
    properties: {
      bucket_id: { type: 'string' },
      path: { type: 'string' },
      permission: { type: 'string' },
      user_id: { type: 'string' },
      type: { type: 'string' },
      email: { type: 'string' },
    },
  });

  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    invariant(Array.isArray(req.body), 'body must be an array');

    const { query } = dbProvider(req);

    for (const item of req.body) {
      const bucket = getBucket(item.bucket_id, app.state);
      const provider = getProvider(bucket);
      const credentials = getCredentials(bucket, app.state);
      const type = item.type.toUpperCase();
      const path =
        type === 'FILE'
          ? normalizeFilePath(item.path)
          : normalizeFolderPath(item.path);

      const access = await hasAccess({
        req,
        bucket,
        path,
        type,
      });

      if (!access) {
        continue;
      }

      if (type === 'FILE') {
        await provider.stat({
          bucket,
          path,
          credentials,
        });
      }

      const tree = path.split('/').map(md5).join('.');

      const user_id = await getUser({
        user_id: item.user_id,
        email: item.email,
      });

      await query(
        `
          INSERT INTO
            "storage"."access"
            (
              "entity_type",
              "bucket_id",
              "path",
              "folder_tree",
              "user_id",
              "permission"
            )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [type, bucket.id, path, tree, user_id, item.permission],
      );
    }

    reply.send({
      ok: true,
    });
  }

  app.route({
    method: 'POST',
    url: '/access',
    handler,
    schema: {
      body: {
        type: 'array',
        items: { $ref: 'https://backyard.io#/storage/access' },
      },
    },
  });

  next();
}
