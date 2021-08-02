import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { EOL } from 'os';
import { randomBytes } from 'crypto';

import which from 'which';
import unzip from 'unzipper';
import fetch from 'node-fetch';
import {
  exists,
  writeAsync,
  dirAsync,
  createWriteStream,
  dir,
} from 'fs-jetpack';

import { WriteAccessError } from './error';
import { spawn } from 'child_process';

export type CreateBackyardOptions = {
  projectDir: string;
  template: string;
  useNpm?: boolean;
};

const templates: Record<string, string> = {
  default:
    'https://github.com/elwood-technology/backyard-workspace/archive/refs/heads/main.zip',
  ts: 'https://github.com/elwood-technology/backyard-workspace-ts/archive/refs/heads/main.zip',
};

export async function createBackyard(
  options: CreateBackyardOptions,
): Promise<void> {
  const { projectDir, template, useNpm } = options;

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

  if (!templateUrl.includes('http')) {
    throw new Error(`Invalid Template Url "${templateUrl}"`);
  }

  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Unexpected response: ${response.statusText}`);
  }

  await dirAsync(projectDir);

  await new Promise((resolve, reject) => {
    response.body
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        const root = entry.path.split('/').shift();
        const out = join(projectDir, entry.path.replace(root, ''));
        dir(dirname(out));

        if (entry.type === 'File') {
          entry.pipe(createWriteStream(out));
        }
      })
      .on('close', resolve)
      .on('error', reject);
  });

  await writeAsync(
    join(projectDir, 'local.env'),
    [
      `MODE = local`,
      `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
      `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
      `JWT_IAT = ${Date.now()}`,
    ].join(EOL),
  );

  await writeAsync(
    join(projectDir, 'remote.env.example'),
    [
      `MODE = remote`,
      `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
      `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
      `JWT_IAT = ${Date.now()}`,
    ].join(EOL),
  );

  const cmd = useNpm ? await which('npm') : await which('yarn');

  await run(cmd, ['install', '--ignore-scripts'], projectDir);
}

export async function run(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
    });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}
