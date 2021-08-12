import { spawn } from 'child_process';

import { Context } from '@backyard/types';

import { TerraformStageDirs } from '../types';

export async function run(
  context: Context,
  args: string[],
  dirs: TerraformStageDirs,
): Promise<number> {
  const cmd = await context.tools.which('terraform');

  return await new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: context.dir.stage,
      env: {
        ...process.env,
        TF_DATA_DIR: dirs.dataDir,
      },
    });

    proc.stdout?.on('data', (data) => {
      context.log(data.toString());
    });

    proc.stderr?.on('data', (data) => {
      context.log(data.toString());
    });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}

export async function runInit(
  context: Context,
  dirs: TerraformStageDirs,
): Promise<number> {
  return await run(
    context,
    ['init', '-backend-config', dirs.backendConfigFile],
    dirs,
  );
}

export async function runPlan(
  context: Context,
  dirs: TerraformStageDirs,
): Promise<number> {
  return await run(context, ['plan'], dirs);
}

export async function runApply(
  context: Context,
  dirs: TerraformStageDirs,
): Promise<number> {
  return await run(context, ['apply', '-auto-approve'], dirs);
}

export async function runDestroy(
  context: Context,
  dirs: TerraformStageDirs,
): Promise<number> {
  return await run(context, ['destroy', '-auto-approve'], dirs);
}
