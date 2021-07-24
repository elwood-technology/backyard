import { spawn } from 'child_process';

export function isDockerRunning(dockerBin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(dockerBin, ['info'], {
      stdio: 'ignore',
    });

    proc.on('error', () => {
      resolve(false);
    });
    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
}
