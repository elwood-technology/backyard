import { FastifyRequest } from 'fastify';
import { invariant } from 'ts-invariant';
import {
  StorageCredential,
  StorageProvider,
  StorageState,
  StorageBucket,
} from './types';

import { User } from './types';

export function getUser(req: FastifyRequest): User {
  invariant(req.user, 'Missing User from Request');
  invariant((req.user as User).sub, 'Missing User ID from Request');
  return req.user as User;
}

export function getBucket(id: string, state: StorageState): StorageBucket {
  const bucket = state.buckets.find((b) => b.id === id);
  invariant(bucket, 'No bucket');
  return bucket;
}

export function getCredentials(
  bucket: StorageBucket,
  state: StorageState,
): StorageCredential['credentials'] | undefined {
  return state.credentials.find((c) => c.name === bucket.credential)
    ?.credentials;
}

export function getProvider(bucket: StorageBucket): StorageProvider {
  return require(`./provider/${bucket.provider}`) as StorageProvider;
}
