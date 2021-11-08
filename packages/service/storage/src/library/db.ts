import { FastifyRequest } from 'fastify';

import type { JsonObject, Json } from '@backyard/types';

import { StorageRequestUser } from '../types';
import { PoolClient } from 'pg';

export type BoundDatabase = {
  query(sql: string, params?: Json[]): Promise<Json[]>;
  queryOne(sql: string, params?: Json[]): Promise<JsonObject | undefined>;
};

export async function queryOne(
  req: FastifyRequest,
  sql: string,
  params: Json[] = [],
): Promise<JsonObject | undefined> {
  const rows = await query(req, sql, params);
  return rows.shift();
}

export function query(
  req: FastifyRequest,
  sql: string,
  params: Json[] = [],
): Promise<JsonObject[]> {
  return new Promise((resolve, reject) => {
    req.server.pg.transact(
      async (client) => {
        await appendUserToTransaction(req, client);
        return await client.query(sql, params);
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result?.rows ?? []);
      },
    );
  });
}

export function dbProvider(req: FastifyRequest): BoundDatabase {
  return {
    async query(sql: string, params?: Json[]) {
      return await query(req, sql, params);
    },
    async queryOne(sql: string, params?: Json[]) {
      return await queryOne(req, sql, params);
    },
  };
}

export async function appendUserToTransaction(
  req: FastifyRequest,
  client: PoolClient,
): Promise<void> {
  const user = req.user as StorageRequestUser;
  const settings = [
    ['request.jwt.claim.sub', user.sub],
    ['request.jwt.claim.role', user.role],
    ['request.jwt.claim.email', user.email],
  ];

  for (const [name, value] of settings) {
    await client.query(`SELECT set_config('${name}', $1, true)`, [value]);
  }
}
