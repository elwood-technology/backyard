import { invariant } from 'ts-invariant';
import { StorageState, StorageBucket, StorageCredential } from '../types';

export function getCredentials(
  bucket: StorageBucket,
  state: StorageState,
): StorageCredential['credentials'] {
  const value = state.credentials.find((c) => c.name === bucket.credential);
  invariant(value, 'No Credentials');
  invariant(value.credentials, 'No Credentials');
  return value.credentials;
}
