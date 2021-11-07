import { FastifyInstance } from 'fastify';
import { StorageBucket } from '.';

export type HasAccessInput = {
  app: FastifyInstance;
  userId: string;
  bucket: StorageBucket;
  path: string;
  type: 'file' | 'folder';
};

export async function hasAccess(input: HasAccessInput): Promise<boolean> {
  const { app, userId, bucket } = input;
  const client = await app.pg.connect();

  const sql = `
    SELECT
      *
    FROM
      "storage"."access"
    WHERE
      "user_id" = $1 AND
      "bucket" = $2
  `;

  const {} = await client.query(sql, [userId, bucket.id]);

  return false;
}
