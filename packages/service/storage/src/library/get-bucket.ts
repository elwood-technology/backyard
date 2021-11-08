import { invariant } from 'ts-invariant';
import { StorageState, StorageBucket } from '../types';

export function getBucket(id: string, state: StorageState): StorageBucket {
  const bucket = state.buckets.find((b) => b.id === id);
  invariant(bucket, 'No bucket');
  return bucket;
}
