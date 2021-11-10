import type { StorageProvider, StorageBucket, StorageState } from '../types';

export function getProvider(
  bucket: StorageBucket,
  state: StorageState,
): StorageProvider {
  const { providers = {} } = state;

  if (bucket.provider in providers) {
    return require(providers[bucket.provider]) as StorageProvider;
  }

  return require(`../provider/${bucket.provider}`) as StorageProvider;
}
