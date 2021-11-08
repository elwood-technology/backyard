export function normalizeFolderPath(path: string): string {
  if (path.startsWith('/')) {
    return normalizeFolderPath(path.substring(1));
  }
  if (!path.endsWith('/')) {
    return `${path}/`;
  }

  return path;
}
export function normalizeFilePath(path: string): string {
  if (path.startsWith('/')) {
    return path.substring(1);
  }

  return path;
}

export function normalizePath(type: 'folder' | 'file', path: string): string {
  return type.toLowerCase() === 'folder'
    ? normalizeFolderPath(path)
    : normalizeFilePath(path);
}
