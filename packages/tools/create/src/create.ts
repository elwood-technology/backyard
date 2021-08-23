import { promises as fs } from 'fs';
import { dirname, extname, join, basename } from 'path';
import { EOL } from 'os';
import { randomBytes } from 'crypto';
import { spawn } from 'child_process';

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
  findAsync,
} from 'fs-jetpack';
import { prompt } from 'enquirer';
import { Ora } from 'ora';

import type { JsonObject, Json } from '@backyard/types';
import { isFunction } from '@backyard/common';

import type { BackyardFile, CreateAppAttributes } from './types';
import { WriteAccessError } from './error';

export type CreateBackyardOptions = {
  projectDir: string;
  example: string;
  useNpm?: boolean;
  runInstall?: boolean;
  runInit?: boolean;
  examplesBranch?: string;
};

export type CreateBackyardTools = {
  spin: Ora;
  log?: (...string: any[]) => void;
  errorLog?: (...string: any[]) => void;
};

const exampleShortcuts: Record<string, string> = {
  default: 'core',
  js: 'core',
  typescript: 'core-typescript',
  ts: 'core-typescript',
};

export async function createBackyard(
  options: CreateBackyardOptions,
  tools: CreateBackyardTools,
): Promise<void> {
  const {
    projectDir,
    example,
    examplesBranch = 'main',
    useNpm = false,
    runInit = true,
    runInstall = true,
  } = options;
  const { spin, errorLog = () => {} } = tools;

  if (exists(projectDir)) {
    throw new Error('Project Dir already exists');
  }

  errorLog(`Creating project dir at ${projectDir}`);

  const rootDir = dirname(projectDir);

  spin.text = `Checking access to ${rootDir}`;

  try {
    await fs.access(rootDir);
  } catch (_) {
    throw new WriteAccessError(rootDir);
  }

  const exampleDir = exampleShortcuts[example] ?? example;
  const sourceUrl = `https://github.com/elwood-technology/backyard/archive/refs/heads/${examplesBranch}.zip`;

  errorLog(`Downloading examples from ${sourceUrl}`);

  if (!sourceUrl.includes('http')) {
    throw new Error(`Invalid Template Url "${sourceUrl}"`);
  }

  spin.text = `Downloading template from ${sourceUrl}`;

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Unexpected response: ${response.statusText}`);
  }

  errorLog(`Creating project dir ${projectDir}`);

  await dirAsync(projectDir);

  spin.text = `Unpacking template`;

  await new Promise((resolve, reject) => {
    response.body
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        const [_, subDir, exampleName, ...restPath] = entry.path.split('/');

        if (subDir === 'examples' && exampleName === exampleDir) {
          const out = join(projectDir, ...restPath);
          dir(dirname(out));
          if (entry.type === 'File') {
            entry.pipe(createWriteStream(out));
            return;
          }
        }

        entry.autodrain();
      })
      .on('close', resolve)
      .on('error', reject);
  });

  spin.text = `Reading backyard.* file`;

  await removeAsync(join(projectDir, 'yarn.lock'));
  await removeAsync(join(projectDir, 'package-lock.json'));

  const cmd = useNpm ? await which('npm') : await which('yarn');

  if (runInstall !== false) {
    spin.text = `Running ${useNpm ? 'npm' : 'yarn'} install`;
    await run(cmd, ['install', '--ignore-scripts'], projectDir, errorLog);
  }

  // finding any possible
  const backyardFile = await readBackyardFile(projectDir);

  spin.stop();

  if (isFunction(backyardFile?.createAppAttributes)) {
    const attr = backyardFile?.createAppAttributes() || [];
    const promptValues = await promptForAttributes(attr);

    await createEnvFile(join(projectDir, '.env.local'), promptValues, attr);
    await createEnvFile(join(projectDir, '.env.remote'), promptValues, attr);
  }

  spin.start();

  if (runInit !== false) {
    spin.text = `Initalizing Backyard`;
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

export async function readBackyardFile(
  dir: string,
): Promise<BackyardFile | undefined> {
  const possibleBackyardFiles = await findAsync(dir, {
    matching: 'backyard.*',
  });

  if (possibleBackyardFiles.length === 0) {
    return undefined;
  }

  if (extname(possibleBackyardFiles[0]) === '.ts') {
    require('ts-node').register({});
  }

  // don't force env to be set
  process.env.BY_SKIP_USE_ENV_CHECK = 'true';

  return require(join(dir, basename(possibleBackyardFiles[0]))) as BackyardFile;
}

export function autofillValue(fill: CreateAppAttributes['autofill']): Json {
  if (fill?.random) {
    return randomBytes(fill.random * 2)
      .toString('hex')
      .substr(0, fill.random);
  }

  return fill?.default;
}

export async function promptForAttributes(
  attributes: CreateAppAttributes[],
): Promise<JsonObject> {
  const questions: JsonObject[] = [];

  for (const attr of attributes) {
    if (attr.prompt) {
      questions.push({
        type: 'input',
        name: attr.env,
        message: attr.prompt,
        initial: autofillValue(attr.autofill),
      });
    }
  }

  // @ts-ignore
  return await prompt(questions);
}

export async function createEnvFile(
  file: string,
  env: JsonObject,
  attributes: CreateAppAttributes[],
): Promise<void> {
  for (const attr of attributes) {
    if (!attr.prompt) {
      env[attr.env] = autofillValue(attr.autofill);
    }
  }

  await writeAsync(
    file,
    Object.keys(env)
      .map((key) => `${key}=${env[key]}`)
      .join(EOL),
  );
}
