import type { Readable } from 'stream';

import type { PoolClient } from 'pg';

import type { JsonObject } from '@backyard/types';

export type StorageNodeTypeName = 'folder' | 'file';
export type StorageNode = {
  bucket: string;
  display_name: string;
  path: string;
  type: StorageNodeTypeName;
};

export interface StorageProviderStatOutputMetaData extends JsonObject {
  contentType?: string;
}

export interface StorageProviderStatOutput extends StorageNode {
  size?: number;
  downloadUrl: string | null;
  playbackUrl: string | null;
  openUrl: string | null;
  metaData?: StorageProviderStatOutputMetaData;
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

export type StorageRequestUser = {
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
  providers: Record<string, string>;
};

export type StorageCredential = {
  name: string;
  credentials: JsonObject;
};

declare module 'fastify' {
  export interface FastifyInstance {
    state: StorageState;
  }

  export interface FastifyRequest {
    client: PoolClient;
  }
}
