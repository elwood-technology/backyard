import { join } from 'path';

import { TerraformGenerator } from 'terraform-generator';

import { invariant, isFunction } from '@backyard/common';
import type { Context, JsonObject } from '@backyard/types';

import { runTerraform } from './run';
import { createTerraformHookArgs } from './hook';

type Dir = {
  destDir: string;
  dataDir: string;
  backendConfigFile: string;
  backendStateFile: string;
};

export function setupForDeployAndTeardown(context: Context): Dir {
  const destDir = join(context.dir.state, 'terraform');
  const dataDir = join(destDir, 'data');
  const backendConfigFile = join(destDir, 'terraform-backend.tfvars');
  const backendStateFile = join(destDir, 'terraform.tfstate');

  return {
    destDir,
    dataDir,
    backendConfigFile,
    backendStateFile,
  };
}

export async function build(context: Context): Promise<void> {
  const tf = new TerraformGenerator();
  invariant(
    isFunction(context.platforms.remote.terraform),
    'Platform does not support Terraform',
  );
  await context.platforms.remote.terraform(
    context,
    createTerraformHookArgs({
      tf,
    }),
  );
  tf.write({
    dir: context.dir.stage,
    format: true,
  });
}

export async function deploy(
  context: Context,
  options: JsonObject = {},
): Promise<void> {
  const { filesystem, which } = context.tools;

  const isDryRun = options['dry-run'] === true;
  const terraformBin = await which('terraform');
  const { destDir, dataDir, backendConfigFile, backendStateFile } =
    setupForDeployAndTeardown(context);

  invariant(terraformBin, 'No terraform in PATH');

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

  const env = {
    ...process.env,
    TF_DATA_DIR: dataDir,
  };

  await runTerraform(
    context,
    terraformBin,
    ['init', '-backend-config', backendConfigFile],
    { env },
  );

  if (isDryRun) {
    return await runTerraform(context, terraformBin, ['plan'], { env });
  }

  await runTerraform(context, terraformBin, ['apply', '-auto-approve'], {
    env,
  });
}

export async function teardown(context: Context): Promise<void> {
  const { which } = context.tools;

  const terraformBin = await which('terraform');
  const { dataDir } = setupForDeployAndTeardown(context);

  const env = {
    ...process.env,
    TF_DATA_DIR: dataDir,
  };

  await runTerraform(context, terraformBin, ['destroy', '-auto-approve'], {
    env,
  });
}
