export type StorageServiceNodeTypeName = 'file' | 'folder';

export type StorageServiceNode = {
  type: StorageServiceNodeTypeName;
  name: string;
  mimeType: string;
  size: number;
};
