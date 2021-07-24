import { FullVersion } from 'package-json';

import { filesystem } from 'gluegun';
import findUp from 'find-up';
import { join } from 'path';

export async function findPackageJson(
  root: string | undefined,
): Promise<string | undefined> {
  if (!root) {
    return undefined;
  }

  if (filesystem.exists(join(root, 'package.json'))) {
    return require(join(root, 'package.json'));
  }

  return await findUp('package.json', {
    cwd: root,
  });
}
export async function readPackageJson(
  root: string,
): Promise<FullVersion | undefined> {
  const file = await findPackageJson(root);

  return file ? require(file) : undefined;
}

export async function findNodeModules(
  cwd: string | undefined,
): Promise<string | undefined> {
  if (!cwd) {
    return undefined;
  }

  return await findUp('node_modules', {
    cwd,
    type: 'directory',
  });
}
