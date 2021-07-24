import { SpawnOptions, spawn } from 'child_process';

import type { Context } from '@backyard/types';

export function runTerraform(
  context: Context,
  cmd: string,
  args: string[],
  options: SpawnOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      // stdio: 'inherit',
      cwd: context.dir.stage,
      ...options,
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
