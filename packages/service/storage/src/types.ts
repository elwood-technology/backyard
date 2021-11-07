import { Readable } from 'stream';

import type { JsonObject } from '@backyard/types';

export type StorageNodeTypeName = 'folder' | 'file' | string;
export type StorageNode = {
  bucket_id: string;
  display_name: string;
  path: string;
  type: StorageNodeTypeName;
};

export interface StorageProviderStatOutput extends StorageNode {
  size?: number;
  downloadUrl: string | null;
  playbackUrl: string | null;
  previewUrl: string | null;
}

export type StorageProviderStatInput = {
  credentials: JsonObject;
  bucket: StorageBucket;
  path: string;
};

export interface StorageProviderReadOutput extends StorageProviderStatOutput {
  content: Readable | ReadableStream;
}

export type StorageProviderReadInput = {
  credentials: JsonObject;
  bucket: StorageBucket;
  path: string;
};

export type User = {
  exp: number;
  sub: string;
  email: string;
  app_metadata: JsonObject;
  user_metadata: JsonObject;
  role: string;
};

export type StorageProviderListInput = {
  credentials: JsonObject;
  bucket: StorageBucket;
  path: string;
};

export type StorageProviderListOutput = {
  nodes: StorageNode[];
};

export type StorageProvider = {
  list(input: StorageProviderListInput): Promise<StorageProviderListOutput>;
  stat(input: StorageProviderStatInput): Promise<StorageProviderStatOutput>;
  read(input: StorageProviderReadInput): Promise<StorageProviderReadOutput>;
};

export interface StorageBucket extends JsonObject {
  id: string;
  displayName: string;
  credential: string;
  provider: string;
}

export type StorageState = {
  credentials: StorageCredential[];
  buckets: StorageBucket[];
};

export type StorageCredential = {
  name: string;
  credentials: JsonObject;
};

declare module 'fastify' {
  export interface FastifyInstance {
    state: StorageState;
  }
}
