import { S3 } from '@aws-sdk/client-s3';

import { StorageProviderListInput, StorageProviderListOutput } from '../types';

type Credentials = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export function createClient(credentials: Credentials): S3 {
  const { region, accessKeyId, secretAccessKey } = credentials;
  return new S3({ region, credentials: { accessKeyId, secretAccessKey } });
}

export async function list(
  input: StorageProviderListInput,
): Promise<StorageProviderListOutput> {
  const { bucket, path, credentials } = input;
  const client = createClient(credentials as Credentials);

  const result = await client.listObjects({
    Bucket: bucket,
    Prefix: path,
  });

  return {
    nodes: [
      ...(result.CommonPrefixes ?? []).map((item) => {
        return {
          provider: 's3',
          bucket,
          path: String(item.Prefix),
          type: 'folder',
        };
      }),
      ...(result.Contents ?? []).map((item) => {
        return {
          provider: 's3',
          bucket,
          path: String(item.Key),
          type: 'file',
        };
      }),
    ],
  };
}
