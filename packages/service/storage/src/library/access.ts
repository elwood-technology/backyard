import { FastifyRequest } from 'fastify';
import debug from 'debug';

import type { StorageBucket } from '../types';
import { StoragePermissionName } from '../constants';
import { dbProvider } from '../library/db';
import { md5 } from './crypto';
import { dirname } from 'path';

const log = debug('by:library:access');

export type HasAccessInput = {
  req: FastifyRequest;
  bucket: StorageBucket;
  path: string;
  type: 'file' | 'folder' | string;
};

export async function hasAccessToFolder(
  input: HasAccessInput,
): Promise<boolean> {
  const { req, bucket, path } = input;
  const { queryOne } = dbProvider(req);
  const parts = path.split('/');
  const tree = parts.map(md5);

  log('has access to %s', path);

  while (tree.length > 0) {
    log('check tree %s', tree.join('.'));

    const row = await queryOne(
      `
      SELECT
        *
      FROM
        "storage"."access"
      WHERE
        "entity_type" = 'FOLDER' AND
        "bucket_id" = $1 AND
        "folder_tree" = $2

    `,
      [bucket.id, tree.join('.')],
    );

    log(' -> %o', row);

    if (row?.permission === StoragePermissionName.None) {
      return false;
    }

    if (row) {
      return true;
    }

    tree.pop();
  }

  log('no access to %s', path);

  return false;
}

export async function hasAccessToFile(
  input: HasAccessInput,
): Promise<boolean | null> {
  const { req, bucket, path } = input;
  const { queryOne } = dbProvider(req);

  log('has access to file %s', path);

  const row = await queryOne(
    `
      SELECT
        *
      FROM
        "storage"."access"
      WHERE
        "bucket_id" = $1 AND
        "path" = $2 AND
        "entity_type" = 'FILE'
    `,
    [bucket.id, path],
  );

  if (!row) {
    return null;
  }

  return row.permission !== StoragePermissionName.None;
}

export async function hasAccess(input: HasAccessInput): Promise<boolean> {
  const { type, path } = input;

  log('hasAccess(%o)', { type, path });

  if (type === 'file') {
    const fileAccess = await hasAccessToFile(input);

    if (fileAccess !== null) {
      return fileAccess;
    }

    return hasAccessToFolder({
      ...input,
      type: 'folder',
      path: dirname(path),
    });
  }

  return hasAccessToFolder(input);
}

export async function getBucketAccess(
  req: FastifyRequest,
): Promise<StorageBucket[]> {
  const sql = `
    SELECT
      DISTINCT "a"."bucket_id",
      "b".*
    FROM
      "storage"."access" "a"
    LEFT JOIN "storage"."buckets" "b" ON "a"."bucket_id" = "b"."id"
  `;

  const { rows } = await req.client.query(sql);

  return rows.map((row) => {
    return { ...row, ...row.attributes };
  }) as StorageBucket[];
}
