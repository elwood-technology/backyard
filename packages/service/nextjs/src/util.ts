import { spawn, SpawnOptions } from 'child_process';
import { Context } from '@backyard/types';
import { isAbsolute, join } from 'path';

export function getSourceDir(context: Context, src: string): string {
  if (isAbsolute(src)) {
    return src;
  }

  return join(context.dir.root, src);
}

export function run(
  cmd: string,
  args: string[],
  options: SpawnOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    // proc.stdout?.on('data', (data) => {
    //   log(data.toString());
    // });

    // proc.stderr?.on('data', (data) => {
    //   log(data.toString());
    // });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}
