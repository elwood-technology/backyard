import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import { md5 } from '../library/crypto';
import { getBucket } from '../library/get-bucket';
import { getCredentials } from '../library/get-credentials';
import { getProvider } from '../library/get-provider';
import { hasAccess, listAccess } from '../library/access';
import {
  normalizeFilePath,
  normalizeFolderPath,
} from '../library/normalize-path';
import { dbProvider } from '../library/db';
import { getOrCreateUser } from '../library/get-or-create-user';
import { StorageRequestUser } from '..';

type Next = () => void;
type Options = {};

export default function fastifyHandleAccess(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  app.route({
    method: 'GET',
    url: '/access/:type/:bucket/*',
    handler: listAccessHandler,
  });

  app.route({
    method: 'POST',
    url: '/access',
    handler: createAccessHandler,
    schema: {
      body: {
        type: 'array',
        items: { $ref: 'https://backyard.io#/storage/access' },
      },
    },
  });

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
      message: { type: 'string' },
    },
  });

  // CREATE
  async function createAccessHandler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    invariant(Array.isArray(req.body), 'body must be an array');

    const user = req.user as StorageRequestUser;
    const { query } = dbProvider(req);

    for (const item of req.body) {
      const bucket = getBucket(item.bucket_id, app.state);
      const provider = getProvider(bucket, app.state);
      const credentials = getCredentials(bucket, app.state);
      const type = item.type.toUpperCase();
      const path =
        type === 'FILE'
          ? normalizeFilePath(item.path)
          : normalizeFolderPath(item.path);

      // service roles should be able to add any one to anything
      if (user.role !== 'service_role') {
        const access = await hasAccess({
          req,
          bucket,
          path,
          type,
        });

        if (!access) {
          continue;
        }
      }

      if (type === 'FILE') {
        await provider.stat({
          bucket,
          path,
          credentials,
        });
      }

      const tree = path.split('/').map(md5).join('.');

      const user_id = await getOrCreateUser({
        req,
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

  // LIST
  async function listAccessHandler(req: FastifyRequest, reply: FastifyReply) {
    const {
      '*': rawPath,
      bucket: id,
      type,
    } = req.params as {
      type: 'file' | 'folder';
      bucket: string;
      '*': string;
    };

    const path = normalizeFilePath(rawPath);
    const bucket = getBucket(id, app.state);
    const access = await hasAccess({
      req,
      bucket,
      path: path,
      type,
    });

    if (!access) {
      reply.code(404);
      reply.send({
        code: 404,
        error: 'Not found',
      });
      return;
    }

    reply.send(
      await listAccess({
        req,
        bucket,
        path,
        type,
      }),
    );
  }

  next();
}
