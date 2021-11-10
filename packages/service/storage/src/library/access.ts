import { FastifyRequest } from 'fastify';
import debug from 'debug';

import type { StorageBucket } from '../types';
import { StoragePermissionName } from '../constants';
import { dbProvider } from '../library/db';
import { md5 } from './crypto';
import { dirname } from 'path';

const log = debug('by:library:access');

export type AccessInput = {
  req: FastifyRequest;
  bucket: StorageBucket;
  path: string;
  type: 'file' | 'folder';
};

export type ListAccessOutputItem = {
  user_id: string;
  email: string;
  permission: StoragePermissionName;
  access_path?: string;
};
export type ListAccessOutput = {
  access: ListAccessOutputItem[];
};

export async function hasAccessToFolder(input: AccessInput): Promise<boolean> {
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

  const row = await queryOne(
    `
      SELECT
        *
      FROM
        "storage"."access"
      WHERE
        "entity_type" = 'FOLDER' AND
        "bucket_id" = $1 AND
        "path" = '/'

    `,
    [bucket.id],
  );

  if (row?.permission !== StoragePermissionName.None) {
    return true;
  }

  log('no access to %s', path);

  return false;
}

export async function hasAccessToFile(
  input: AccessInput,
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

export async function hasAccess(input: AccessInput): Promise<boolean> {
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
    LEFT JOIN
      "storage"."buckets" "b" ON "a"."bucket_id" = "b"."id"
    WHERE
      "a"."permission" != 'NONE'
  `;

  const { rows } = await req.client.query(sql);

  return rows.map((row) => {
    return { ...row, ...row.attributes };
  }) as StorageBucket[];
}

export async function listAccess(
  input: AccessInput,
): Promise<ListAccessOutput> {
  const { req, type, bucket, path } = input;
  const { query } = dbProvider(req);

  if (type === 'file') {
    return {
      access: await query(
        `
          SELECT
            "a"."user_id",
            "a"."permission",
            "u"."email"
          FROM
            "storage"."access" "a"
          LEFT JOIN
            "auth"."users" "u" ON "a"."user_id" = "u"."id"
          WHERE
            "a"."bucket_id" = $1 AND
            "a"."path" = $2 AND
            "a"."entity_type" = 'FILE'
        `,
        [bucket.id, path],
      ),
    };
  }

  const access: ListAccessOutputItem[] = [];
  const parts = path.split('/');
  const tree = parts.map(md5);

  while (tree.length > 0) {
    const foundIds = access.map((item) => item.user_id);
    const rows = await query(
      `
       SELECT
          "a"."user_id",
          "a"."permission",
          "a"."path" as "access_path",
          "u"."email"
        FROM
          "storage"."access" "a"
        LEFT JOIN
          "auth"."users" "u" ON "a"."user_id" = "u"."id"
        WHERE
          "a"."bucket_id" = $1 AND
          "a"."folder_tree" = $2 AND
          "a"."entity_type" = 'FOLDER' AND
          NOT ("a"."user_id" = ANY($3::uuid[]))
    `,
      [bucket.id, tree.join('.'), foundIds],
    );

    access.push(...rows);
    tree.pop();
  }

  return {
    access,
  };
}
