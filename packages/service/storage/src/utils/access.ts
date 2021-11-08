import { FastifyInstance } from 'fastify';

import type { StorageBucket } from '../types';
import { md5 } from '../utils/crypto';

export type HasAccessInput = {
  app: FastifyInstance;
  userId: string;
  bucket: StorageBucket;
  path: string;
  type: 'file' | 'folder' | string;
};

export async function hasAccess(input: HasAccessInput): Promise<boolean> {
  const { app, userId, bucket, path } = input;
  const client = await app.pg.connect();

  const parts = path.split('/');
  const tree = parts.filter((item) => item.length > 0).map(md5);

  const sql = `
    SELECT
      *
    FROM
      "storage"."access"
    WHERE
      "user_id" = $1 AND
      "bucket" = $2 AND
      "folder_tree" <@ text2ltree($3)
  `;

  const { rows } = await client.query(sql, [userId, bucket.id, tree.join('.')]);

  if (rows.length > 0) {
    return true;
  }

  const sql2 = `
    SELECT
      *
    FROM
      "storage"."access"
    WHERE
      "user_id" = $1 AND
      "bucket" = $2 AND
      "path" = '/'
  `;

  const r = await client.query(sql2, [userId, bucket.id]);

  return r.rows.length > 0;
}

export async function getBucketAccess(
  app: FastifyInstance,
): Promise<StorageBucket[]> {
  const client = await app.pg.connect();

  const sql = `
    SELECT
      DISTINCT "a"."bucket",
      "b".*
    FROM
      "storage"."access" "a"
    LEFT JOIN "storage"."buckets" "b" ON "a"."bucket" = "b"."id"
  `;

  const { rows } = await client.query(sql);

  return rows.map((row) => {
    return { ...row, ...row.attributes };
  }) as StorageBucket[];
}
