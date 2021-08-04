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
  removeAsync,
} from 'fs-jetpack';

import { WriteAccessError } from './error';
import { spawn } from 'child_process';

export type CreateBackyardOptions = {
  projectDir: string;
  template: string;
  useNpm?: boolean;
  runInstall?: boolean;
  runInit?: boolean;
};

export type CreateBackyardTools = {
  spin?: (text: string) => void;
  log?: (...string: any[]) => void;
  errorLog?: (...string: any[]) => void;
};

const templates: Record<string, string> = {
  default:
    'https://github.com/elwood-technology/backyard-workspace/archive/refs/heads/main.zip',
  ts: 'https://github.com/elwood-technology/backyard-workspace-ts/archive/refs/heads/main.zip',
  typescript:
    'https://github.com/elwood-technology/backyard-workspace-ts/archive/refs/heads/main.zip',
};

export async function createBackyard(
  options: CreateBackyardOptions,
  tools: CreateBackyardTools = {},
): Promise<void> {
  const {
    projectDir,
    template,
    useNpm = false,
    runInit = true,
    runInstall = true,
  } = options;
  const { spin = () => {}, errorLog = () => {} } = tools;

  if (exists(projectDir)) {
    throw new Error('Project Dir already exists');
  }

  errorLog(`Creating project dir at ${projectDir}`);

  const rootDir = dirname(projectDir);

  spin(`Checking access to ${rootDir}`);

  try {
    await fs.access(rootDir);
  } catch (_) {
    throw new WriteAccessError(rootDir);
  }

  const templateUrl = templates[template] ?? template;

  errorLog(`Downloading template from ${templateUrl}`);

  if (!templateUrl.includes('http')) {
    throw new Error(`Invalid Template Url "${templateUrl}"`);
  }

  spin(`Downloading template from ${templateUrl}`);

  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Unexpected response: ${response.statusText}`);
  }

  errorLog(`Creating project dir ${projectDir}`);

  await dirAsync(projectDir);

  spin(`Unpacking template`);

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

  spin(`Writing local.env`);

  await writeAsync(
    join(projectDir, 'local.env'),
    [
      `MODE = local`,
      `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
      `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
      `JWT_IAT = ${Date.now()}`,
    ].join(EOL),
  );

  spin(`Writing remote.env.example`);

  await writeAsync(
    join(projectDir, 'remote.env.example'),
    [
      `MODE = remote`,
      `OPERATOR_TOKEN = ${randomBytes(100).toString('hex')}`,
      `JWT_SECRET = ${randomBytes(32).toString('hex')}`,
      `JWT_IAT = ${Date.now()}`,
    ].join(EOL),
  );

  await removeAsync(join(projectDir, 'yarn.lock'));
  await removeAsync(join(projectDir, 'package-lock.json'));

  const cmd = useNpm ? await which('npm') : await which('yarn');

  if (runInstall !== false) {
    spin(`Running ${useNpm ? 'npm' : 'yarn'} install`);
    await run(cmd, ['install', '--ignore-scripts'], projectDir, errorLog);
  }

  if (runInit !== false) {
    spin(`Initalizing Backyard`);
    await run(cmd, ['run', 'backyard', 'init'], projectDir, errorLog);
  }
}

export async function run(
  cmd: string,
  args: string[],
  cwd: string,
  log: CreateBackyardTools['errorLog'] = () => {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    log(`Running ${cmd} ${args.join(' ')}`);

    const proc = spawn(cmd, args, {
      cwd,
    });

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        log(`STDOUT: ${data.toString()}`);
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        log(`STDERR: ${data.toString()}`);
      });
    }

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Process exited with code ${code}`));
      }

      resolve();
    });
  });
}
