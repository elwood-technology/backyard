import { join } from 'path';

import type {
  PlatformCommandHookArgs,
  PlatformHookArgs,
} from '@backyard/types';

import { buildKubernetesDeployment } from './deployment';

export async function before({ context: _ }: PlatformHookArgs): Promise<void> {}

export async function build(args: PlatformCommandHookArgs): Promise<void> {
  const { context, commandOptions: _ } = args;
  const { filesystem } = context.tools;
  const services = Array.from(context.services.values());

  await filesystem.writeAsync(
    join(context.dir.stage, 'deployment.yml'),
    buildKubernetesDeployment(services),
  );
}

export async function start(_args: PlatformCommandHookArgs): Promise<void> {
  // const { context, commandOptions } = args;
}

export async function stop(_args: PlatformCommandHookArgs): Promise<void> {
  // const { context, commandOptions } = args;
}

export async function clean(_args: PlatformCommandHookArgs): Promise<void> {
  // const { context, commandOptions } = args;
}
