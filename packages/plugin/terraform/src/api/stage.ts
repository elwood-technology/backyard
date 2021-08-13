import { join } from 'path';

import type { Context } from '@backyard/types';

import { TerraformStageDirs } from '../types';

export async function prepareStage(
  context: Context,
): Promise<TerraformStageDirs> {
  const { filesystem } = context.tools;
  const destDir = join(context.dir.state, 'terraform');
  const dataDir = join(destDir, 'data');
  const backendConfigFile = join(destDir, 'terraform-backend.tfvars');
  const backendStateFile = join(destDir, 'terraform.tfstate');

  await filesystem.dirAsync(destDir);
  await filesystem.dirAsync(dataDir);

  await filesystem.writeAsync(
    backendConfigFile,
    `path = "${backendStateFile}"`,
  );

  await filesystem.writeAsync(
    join(context.dir.stage, 'backend.tf'),
    `terraform {
      backend "local" {
        path = "${backendConfigFile}"
      }
    }`,
  );

  return {
    destDir,
    dataDir,
    backendConfigFile,
    backendStateFile,
  };
}
