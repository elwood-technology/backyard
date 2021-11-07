import { S3 } from '@aws-sdk/client-s3';
import invariant from 'ts-invariant';
import { StorageBucket } from '../types';

import {
  StorageProviderListInput,
  StorageProviderListOutput,
  StorageProviderStatOutput,
  StorageProviderStatInput,
  StorageProviderReadOutput,
  StorageProviderReadInput,
} from '../types';

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
  const { bucketName } = bucket as StorageBucket & { bucketName: string };

  const result = await client.listObjects({
    Bucket: bucketName,
    Prefix: path,
  });

  return {
    nodes: [
      ...(result.CommonPrefixes ?? []).map((item) => {
        return {
          bucket_id: bucket.id,
          display_name: String(item.Prefix),
          path: String(item.Prefix),
          type: 'folder',
        };
      }),
      ...(result.Contents ?? []).map((item) => {
        return {
          bucket_id: bucket.id,
          display_name: String(item.Key),
          path: String(item.Key),
          type: 'file',
        };
      }),
    ],
  };
}

export async function stat(
  input: StorageProviderStatInput,
): Promise<StorageProviderStatOutput> {
  const { bucket, path, credentials } = input;
  const client = createClient(credentials as Credentials);
  const { bucketName } = bucket as StorageBucket & { bucketName: string };

  const result = await client.headObject({
    Bucket: bucketName,
    Key: path,
  });

  return {
    type: 'file',
    bucket_id: bucket.id,
    display_name: path,
    path,
    size: Number(result.ContentLength),
    downloadUrl: null,
    previewUrl: null,
    playbackUrl: null,
  };
}

export async function read(
  input: StorageProviderReadInput,
): Promise<StorageProviderReadOutput> {
  const { bucket, path, credentials } = input;
  const client = createClient(credentials as Credentials);
  const { bucketName } = bucket as StorageBucket & { bucketName: string };

  const result = await client.getObject({
    Bucket: bucketName,
    Key: path,
  });

  invariant(result.Body instanceof ReadableStream, 'Body is required');

  return {
    type: 'file',
    bucket_id: bucket.id,
    display_name: path,
    path,
    size: Number(result.ContentLength),
    content: result.Body,
    downloadUrl: null,
    playbackUrl: null,
    previewUrl: null,
  };
}
