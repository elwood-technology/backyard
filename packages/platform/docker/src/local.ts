import { join } from 'path';

import type {
  Context,
  PlatformCommandHookArgs,
  PlatformHookArgs,
} from '@backyard/types';
import { invariant } from '@backyard/common';

import { createDockerCompose } from './docker-compose';
import { run } from './run';
import { isDockerRunning } from './util';

export async function before({ context }: PlatformHookArgs): Promise<void> {
  const dockerPath = await context.tools.which('docker');

  if (!(await isDockerRunning(dockerPath))) {
    throw new Error('Docker is not running');
  }
}

export async function build(args: PlatformCommandHookArgs): Promise<void> {
  const { context, commandOptions } = args;
  const { filesystem } = context.tools;
  const services = Array.from(context.services.values());
  const dockerComposeCmdPath = await getDockerComposePath(context);

  const { ['project-name']: projectName = 'by', docker = true } =
    commandOptions;

  await filesystem.writeAsync(
    join(context.dir.stage, 'docker-compose.yml'),
    createDockerCompose(context.dir.stage, services),
  );

  if (docker !== false) {
    await run(
      dockerComposeCmdPath,
      ['build', '--no-cache'],
      {
        cwd: context.dir.stage,
      },
      context.log,
    );

    await run(
      dockerComposeCmdPath,
      [
        '--project-name',
        projectName,
        'up',
        '--no-start',
        '--renew-anon-volumes',
      ],
      {
        cwd: context.dir.stage,
      },
      context.log,
    );
  }
}

export async function start(args: PlatformCommandHookArgs): Promise<void> {
  const { context, commandOptions } = args;
  const { ['project-name']: projectName = 'by' } = commandOptions;
  const dockerComposeCmdPath = await getDockerComposePath(context);

  await run(
    dockerComposeCmdPath,
    ['--project-name', projectName, 'start'],
    {
      cwd: context.dir.stage,
    },
    context.log,
  );
}

export async function stop(args: PlatformCommandHookArgs): Promise<void> {
  const { context, commandOptions } = args;
  const dockerComposeCmdPath = await getDockerComposePath(context);
  const { ['project-name']: projectName = 'by' } = commandOptions;

  await run(
    dockerComposeCmdPath,
    ['--project-name', projectName, 'stop'],
    {
      cwd: context.dir.stage,
    },
    context.log,
  );
}

export async function clean(args: PlatformCommandHookArgs): Promise<void> {
  const { context, commandOptions } = args;
  const { ['project-name']: projectName = 'by' } = commandOptions;
  const dockerComposeCmdPath = await getDockerComposePath(context);

  await run(
    dockerComposeCmdPath,
    ['--project-name', projectName, 'down', '--remove-orphans'],
    {
      cwd: context.dir.stage,
    },
    context.log,
  );
}

export async function getDockerComposePath(context: Context): Promise<string> {
  const dockerComposeCmdPath = await context.tools.which('docker-compose');

  invariant(dockerComposeCmdPath, 'Unable to find "docker-compose" in system');
  return dockerComposeCmdPath;
}
