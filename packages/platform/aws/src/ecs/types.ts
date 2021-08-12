import type { TerraformHookArgs, Resource } from '@backyard/plugin-terraform';

export interface AwsEcsTerraformHookArgs extends TerraformHookArgs {
  state: AwsEcsTerraformState;
}

export interface AwsEcsTerraformState {
  region: string;
  profile: string;
  vpc: Resource;
  privateSubnets: Resource;
  publicSubnets: Resource;
  albSecurityGroup: Resource;
  alb: Resource;
}

export interface AwsRemoteEcsOptions {
  cluster?: string;
  containerCpu?: number;
  containerMemory?: number;
  healthCheck?: {
    command: string[];
    interval?: number;
    timeout?: number;
    retries?: number;
    startPeriod?: number;
  };
}
