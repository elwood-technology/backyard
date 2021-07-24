import { promises as fs } from 'fs';
import { dirname, extname, join, relative } from 'path';

import {
  dirAsync,
  existsAsync,
  copyAsync,
  findAsync,
  writeAsync,
  removeAsync,
} from 'fs-jetpack';

import { WriteAccessError, InvalidateTemplate } from './error';

export type CreateBackyardOptions = {
  projectDir: string;
  projectName: string;
  template: string;
};

export async function createBackyard(
  options: CreateBackyardOptions,
): Promise<void> {
  const { projectDir, projectName, template } = options;

  const rootDir = dirname(projectDir);
  const templateDir = join(__dirname, '../templates', template);

  try {
    await fs.access(rootDir);
  } catch (_) {
    throw new WriteAccessError(rootDir);
  }

  if (!(await existsAsync(templateDir))) {
    throw new InvalidateTemplate(template);
  }

  await removeAsync(projectDir);

  dirAsync(projectDir);

  const templateFiles = await findAsync(templateDir, {
    matching: ['**/*', '!**/node_modules/**'],
  });

  for (const file of templateFiles) {
    const destFileName = relative(templateDir, file);
    const destName =
      extname(destFileName) === '.tpl'
        ? destFileName.replace('.tpl', '')
        : destFileName;

    await copyAsync(file, join(projectDir, destName));
  }

  const projectPackageFile = join(projectDir, 'package.json');
  const projectPackage = require(projectPackageFile);

  projectPackage.name = projectName;

  await writeAsync(projectPackageFile, JSON.stringify(projectPackage, null, 2));
}
