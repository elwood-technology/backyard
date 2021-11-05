import { FastifyRequest } from 'fastify';
import { invariant } from 'ts-invariant';
import { StorageCredential, StorageState } from '.';

import { User } from './types';

export function getUser(req: FastifyRequest): User {
  invariant(req.user, 'Missing User from Request');
  invariant((req.user as User).sub, 'Missing User ID from Request');
  return req.user as User;
}

export function getCredentials(
  bucketName: string,
  state: StorageState,
): StorageCredential['credentials'] | undefined {
  const bucket = state.buckets.find((b) => b.name === bucketName);
  return state.credentials.find((c) => c.name === bucket?.credential)
    ?.credentials;
}
