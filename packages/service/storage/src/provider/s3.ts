import { basename } from 'path';

import { S3 } from '@aws-sdk/client-s3';
import invariant from 'ts-invariant';
import { StorageBucket } from '../types';

import { StorageMetaDataName } from '../constants';

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

export function createClient(credentials: Credentials, region: string): S3 {
  const { accessKeyId, secretAccessKey } = credentials;
  invariant(accessKeyId, 'Missing accessKeyId');
  invariant(secretAccessKey, 'Missing secretAccessKey');
  return new S3({ region, credentials: { accessKeyId, secretAccessKey } });
}

export async function list(
  input: StorageProviderListInput,
): Promise<StorageProviderListOutput> {
  const { bucket, path, credentials } = input;
  const { bucketName, region } = bucket as StorageBucket & {
    bucketName: string;
  };

  const client = createClient(credentials as Credentials, region);

  const result = await client.listObjects({
    Bucket: bucketName,
    Prefix: path ?? '',
    Delimiter: '/',
  });

  return {
    nodes: [
      ...(result.CommonPrefixes ?? []).map((item) => {
        return {
          bucket: bucket.id,
          display_name: basename(String(item.Prefix)),
          path: String(item.Prefix),
          type: 'folder',
        };
      }),
      ...(result.Contents ?? []).map((item) => {
        return {
          bucket: bucket.id,
          display_name: basename(String(item.Key)),
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
  const { bucketName, region } = bucket as StorageBucket & {
    bucketName: string;
  };
  const client = createClient(credentials as Credentials, region);

  const result = await client.headObject({
    Bucket: bucketName,
    Key: path,
  });

  return {
    type: 'file',
    bucket: bucket.id,
    display_name: basename(path),
    path,
    size: Number(result.ContentLength),
    downloadUrl: null,
    previewUrl: null,
    playbackUrl: null,
    metaData: {
      [StorageMetaDataName.Type]: result.ContentType,
      [StorageMetaDataName.Disposition]: result.ContentDisposition,
      [StorageMetaDataName.Language]: result.ContentLanguage,
      [StorageMetaDataName.Encoding]: result.ContentEncoding,
      [StorageMetaDataName.LastModified]: result.LastModified,
    },
  };
}

export async function read(
  input: StorageProviderReadInput,
): Promise<StorageProviderReadOutput> {
  const { bucket, path, credentials } = input;
  const { bucketName, region } = bucket as StorageBucket & {
    bucketName: string;
  };
  const client = createClient(credentials as Credentials, region);

  const base = await stat({ bucket, path, credentials });

  const result = await client.getObject({
    Bucket: bucketName,
    Key: path,
  });

  invariant(result.Body instanceof ReadableStream, 'Body is required');

  return {
    ...base,
    content: result.Body,
  };
}
