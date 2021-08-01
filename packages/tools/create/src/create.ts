import { promises as fs } from 'fs';
import { basename, dirname, join } from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { EOL } from 'os';
import { randomBytes } from 'crypto';

import unzip from 'unzipper';
import fetch from 'node-fetch';
import {
  exists,
  writeAsync,
  // existsAsync,
  // moveAsync,
  findAsync,
} from 'fs-jetpack';

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

  const _projectDirName = dirname(projectDir);
  const templateUrl = templates[template] ?? template;
  const streamPipeline = promisify(pipeline);
  const response = await fetch(templateUrl);

  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);

  await streamPipeline(
    response.body,
    unzip.Extract({ path: rootDir }).on('entry', (file) => {
      console.log(file);
    }),
  );

  // await new Promise((resolve) => {
  //   response.body.pipe(unzipper.Parse()).on('entry', function (entry) {
  //     const fileName = entry.path;
  //     const type = entry.type; // 'Directory' or 'File'
  //     const size = entry.vars.uncompressedSize; // There is also compressedSize;
  //     if (fileName === "this IS the file I'm looking for") {
  //       entry.pipe(fs.createWriteStream('output/path'));
  //     } else {
  //       entry.autodrain();
  //     }
  //   });
  // });

  const zip = await findAsync(rootDir, {
    matching: '*',
    directories: false,
    files: true,
    recursive: false,
  });

  console.log(zip, basename(templateUrl));

  // await moveAsync(join(rootDir, zip[0]), join(rootDir, projectDirName));

  await writeAsync(
    join(projectDir, 'local.env'),
    [
      `MODE = local`,
      `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
      `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
      `JWT_IAT = ${Date.now() / 1000}`,
    ].join(EOL),
  );

  // await writeAsync(
  //   join(projectDir, 'remote.env'),
  //   [
  //     `MODE = remote`,
  //     `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
  //     `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
  //     `JWT_IAT = ${Date.now() / 1000}`,
  //   ].join(EOL),
  // );
}
