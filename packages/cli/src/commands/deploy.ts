import { join } from 'path';
import { SpawnOptions, spawn } from 'child_process';

import { ContextModeBuild, invariant } from '@backyard/common';
import { Toolbox } from '../types';
import build from './build';

export const SUB_COMMANDS = ['default', 'teardown'];

export const SUB_COMMANDS_DESC = [
  'setup the .backyard/dev folder',
  'start docker services',
];

export default {
  name: 'deploy',
  async run(tools: Toolbox) {
    const subCommand = tools.parameters.first ?? 'default';

    if (!SUB_COMMANDS.includes(subCommand)) {
      tools.print.error(`Unknown command "${subCommand}"`);
      tools.print.info(`Must be one of ${SUB_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    if (tools.parameters.options.build === true) {
      await build.run(tools);
    }

    const isDryRun = tools.parameters.options['dry-run'] === true;
    const context = await tools.createContext(ContextModeBuild);
    const destDir = join(context.dir.backyard, 'deploy');
    const backendConfigFile = join(destDir, 'terraform-backend.tf');
    const backendStateFile = join(destDir, 'terraform.tfstate');
    const terraformBin = tools.system.which('terraform');

    invariant(terraformBin, 'No terraform in PATH');

    await tools.filesystem.dirAsync(destDir);

    await tools.filesystem.writeAsync(
      backendConfigFile,
      `path = "${backendStateFile}"`,
    );

    await tools.filesystem.writeAsync(
      join(context.dir.dest, 'backend.tf'),
      `
        terraform {
          backend "local" {}
        }
      `,
    );

    const env = {
      ...process.env,
      TF_DATA_DIR: join(destDir, '.terraform'),
    };

    if (subCommand === 'teardown') {
      await runTerraform(
        terraformBin,
        ['destroy', '-auto-approve'],
        { env },
        tools,
      );

      return;
    }

    await runTerraform(
      terraformBin,
      ['init', '--backend-config', backendConfigFile],
      { env },
      tools,
    );

    if (isDryRun) {
      return await runTerraform(terraformBin, ['plan'], { env }, tools);
    }

    await runTerraform(
      terraformBin,
      ['apply', '-auto-approve'],
      { env },
      tools,
    );
  },
};

export async function teardown(): Promise<void> {}

export function runTerraform(
  cmd: string,
  args: string[],
  options: SpawnOptions,
  tools: Toolbox,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      // stdio: 'inherit',
      cwd: tools.context.dir.dest,
      ...options,
    });

    proc.stdout?.on('data', (data) => {
      tools.print.info(data.toString());
    });

    proc.stderr?.on('data', (data) => {
      tools.print.info(data.toString());
    });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}
