import { basename } from 'path';

import { S3 } from '@aws-sdk/client-s3';
import invariant from 'ts-invariant';
import debug from 'debug';

import { StorageBucket, StorageNode } from '../types';
import { StorageMetaDataName } from '../constants';

import {
  StorageProviderListInput,
  StorageProviderListOutput,
  StorageProviderStatOutput,
  StorageProviderStatInput,
  StorageProviderReadOutput,
  StorageProviderReadInput,
} from '../types';

type Input =
  | StorageProviderListInput
  | StorageProviderStatInput
  | StorageProviderReadInput;

const log = debug('by:provider:s3');

export function getBucketName(input: Input): string {
  const { bucketName } = input.bucket as StorageBucket & {
    bucketName: string;
  };
  return bucketName;
}

export function createClient(input: Input): S3 {
  const { bucket, credentials } = input;
  const { accessKeyId, secretAccessKey } = credentials;
  const { region } = bucket as StorageBucket & {
    region: string;
  };

  log(
    'client(%s, %s, %s)',
    region,
    accessKeyId.replace(/./g, '*'),
    secretAccessKey.replace(/./g, '*'),
  );

  invariant(accessKeyId, 'Missing accessKeyId');
  invariant(secretAccessKey, 'Missing secretAccessKey');
  return new S3({ region, credentials: { accessKeyId, secretAccessKey } });
}

export async function list(
  input: StorageProviderListInput,
): Promise<StorageProviderListOutput> {
  const { bucket, path } = input;
  const client = createClient(input);

  const params = {
    Bucket: getBucketName(input),
    Prefix: path ?? '',
    Delimiter: '/',
  };

  log('listObjects(%o)', params);

  const result = await client.listObjects(params);

  return {
    nodes: [
      ...(result.CommonPrefixes ?? []).map((item) => {
        return {
          bucket: bucket.id,
          display_name: basename(String(item.Prefix)),
          path: String(item.Prefix),
          type: 'folder',
        } as StorageNode;
      }),
      ...(result.Contents ?? []).map((item) => {
        return {
          bucket: bucket.id,
          display_name: basename(String(item.Key)),
          path: String(item.Key),
          type: 'file',
        } as StorageNode;
      }),
    ],
  };
}

export async function stat(
  input: StorageProviderStatInput,
): Promise<StorageProviderStatOutput> {
  const { bucket, path } = input;
  const client = createClient(input);
  const params = {
    Bucket: getBucketName(input),
    Key: path,
  };

  log('headObject(%o)', params);

  const result = await client.headObject(params);

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
  const client = createClient(input);
  const base = await stat({ bucket, path, credentials });
  const params = {
    Bucket: getBucketName(input),
    Key: path,
  };

  log('getObject(%o)', params);

  const result = await client.getObject(params);

  invariant(result.Body instanceof ReadableStream, 'Body is required');

  return {
    ...base,
    content: result.Body,
  };
}
