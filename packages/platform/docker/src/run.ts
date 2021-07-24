import { spawn, SpawnOptions } from 'child_process';
import type { Context } from '@backyard/types';

export function run(
  cmd: string,
  args: string[],
  options: SpawnOptions,
  log: Context['log'],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    proc.stdout?.on('data', (data) => {
      log(data.toString());
    });

    proc.stderr?.on('data', (data) => {
      log(data.toString());
    });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}
