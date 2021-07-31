import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

import unzip from 'unzipper';
import fetch from 'node-fetch';
import { exists, tmpDirAsync, findAsync } from 'fs-jetpack';

import { WriteAccessError } from './error';

export type CreateBackyardOptions = {
  projectDir: string;
  projectName: string;
  template: string;
};

const templates: Record<string, string> = {
  default:
    'https://github.com/elwood-technology/backyard-project-ts/archive/refs/heads/master.zip',
  ts: 'https://github.com/elwood-technology/backyard-project-ts/archive/refs/heads/master.zip',
};

export async function createBackyard(
  options: CreateBackyardOptions,
): Promise<void> {
  const { projectDir, projectName: _, template } = options;

  if (exists(projectDir)) {
    throw new Error('Project Dir already exists');
  }

  const rootDir = dirname(projectDir);

  try {
    await fs.access(rootDir);
  } catch (_) {
    throw new WriteAccessError(rootDir);
  }

  const templateUrl = templates[template] ?? template;
  const tmp = await tmpDirAsync({
    prefix: 'backyard-',
  });
  const streamPipeline = promisify(pipeline);
  const response = await fetch(templateUrl);

  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);

  await streamPipeline(response.body, unzip.Extract({ path: tmp.cwd() }));

  const tmpDirRoot = await tmp.findAsync({
    matching: '*',
    recursive: false,
    directories: true,
    files: false,
  });

  const srcDir = join(tmp.cwd(), tmpDirRoot[0]);

  const files = await findAsync(srcDir, {
    matching: ['**/*', '*'],
    recursive: true,
    directories: true,
    files: true,
  });

  for (const file of files) {
    console.log(
      `copying ${file}`,
      join(projectDir, file.substr(srcDir.length)),
    );

    // await copyAsync(file, join(projectDir, file.substr(srcDir.length)));
  }
}
