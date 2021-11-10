import type { FastifyRequest } from 'fastify';
import axios from 'axios';
import invariant from 'ts-invariant';

import { queryOne } from '../library/db';

export type GetUserInput = {
  req: FastifyRequest;
  user_id?: string;
  email?: string;
};

export async function getOrCreateUser(input: GetUserInput): Promise<string> {
  const { req } = input;
  if (input.user_id) {
    return input.user_id;
  }

  // find user by email
  const row = await queryOne(
    req,
    `
      SELECT "id"
      FROM "auth"."users"
      WHERE
        email = $1
    `,
    [input.email],
  );

  if (row?.id) {
    return row.id;
  }

  const { AUTH_BASE_URL } = process.env ?? {};

  invariant(AUTH_BASE_URL, 'Missing AUTH_BASE_URL');

  const body = {
    email: input.email,
    confirm: true,
  };
  const token = req.server.jwt.sign({ role: 'service_role' });
  const { data } = await axios.post(`${AUTH_BASE_URL}/admin/users`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  invariant(data.id, 'Missing id');

  return data.id;
}
