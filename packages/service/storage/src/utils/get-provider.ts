import { StorageProvider, StorageBucket } from '../types';

export function getProvider(bucket: StorageBucket): StorageProvider {
  return require(`../provider/${bucket.provider}`) as StorageProvider;
}
