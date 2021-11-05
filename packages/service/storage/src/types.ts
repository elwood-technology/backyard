import type { JsonObject } from '@backyard/types';

export type StorageNodeTypeName = 'folder' | 'file' | string;
export type StorageNode = {
  provider: string;
  bucket: string;
  path: string;
  type: StorageNodeTypeName;
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
  bucket: string;
  path: string;
};

export type StorageProviderListOutput = {
  nodes: StorageNode[];
};

export type StorageProvider = {
  list(input: StorageProviderListInput): Promise<StorageProviderListOutput>;
};

export type StorageState = {
  credentials: StorageCredential[];
  buckets: Array<{ name: string; displayName: string; credential: string }>;
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
