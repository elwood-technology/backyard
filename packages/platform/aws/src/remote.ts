import { AbstractRemotePlatform } from '@backyard/common';

import type {
  PlatformCommandHookArgs,
  PlatformInitArgs,
} from '@backyard/types';

import { getServices } from '@backyard/common';

import type {
  AwsRemoteOptions,
  AwsRemotePlugins,
  AwsRemoteTerraformHookArgs,
} from './types';
import { addVpc } from './vpn';

export class AwsRemotePlatform extends AbstractRemotePlatform<
  AwsRemoteOptions,
  AwsRemotePlugins
> {
  async init(args: PlatformInitArgs) {
    args.registerPlugin('terraform', '@backyard/plugin-terraform');
  }

  async build(args: PlatformCommandHookArgs<AwsRemotePlugins>) {
    const { context, plugins, commandOptions } = args;
    const { profile, region, vpc } = this.getOptions();

    const state = await plugins.terraform.createState();

    state.generator.provider('aws', {
      region: region,
      profile: profile,
    });

    state.add('data', 'aws_availability_zones', 'available', {
      state: 'available',
    });

    const hookArgs: AwsRemoteTerraformHookArgs = {
      options: this.getOptions(),
      state,
      vpc() {
        if (vpc) {
          return state.get('resource', 'aws_vpc', vpc.name);
        }
        return undefined;
      },
    };

    addVpc(hookArgs);

    const services = getServices(context);

    for (const service of services) {
      await service.hook('aws', hookArgs);
    }

    state.write(context.dir.stage);

    if (commandOptions['run-init'] !== false) {
      await plugins.terraform.runInit(
        context,
        await plugins.terraform.prepareStage(context),
      );
    }
  }

  async deploy(args: PlatformCommandHookArgs) {
    const { context, commandOptions, plugins } = args;
    const isDryRun = commandOptions['dry-run'] === true;
    const stageDirs = await plugins.terraform.prepareStage(context);

    if (isDryRun) {
      return await plugins.terraform.runPlan(context, stageDirs);
    }

    await plugins.terraform.runApply(context, stageDirs);
  }

  async clean(_args: PlatformCommandHookArgs) {
    // await remote.teardown(args);
  }

  async teardown(args: PlatformCommandHookArgs) {
    const { context, plugins } = args;

    const stageDirs = await plugins.terraform.prepareStage(context);

    await plugins.terraform.runDestroy(context, stageDirs);
  }
}
