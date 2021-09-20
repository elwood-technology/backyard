import TerraformPlugin, {
  TerraformState,
  Resource,
} from '@backyard/plugin-terraform';
import type { JsonObject } from '@backyard/types';

export type AwsRemotePlugins = {
  terraform: typeof TerraformPlugin;
};

export type AwsRemoteOptionsVpc = {
  name?: string;
  subnetCount?: number;
};

export type AwsRemoteOptionsAlb = {
  name: string;
};

export type AwsRemoteOptions = {
  profile: string;
  region: string;
  vpc?: AwsRemoteOptionsVpc | AwsRemoteOptionsVpc[];
  ecs?: {
    clusters?: Array<{
      name: string;
      cpu: number;
      memory: number;
      alb?: string;
      vpc?: string;
    }>;
  };
  alb?: AwsRemoteOptionsAlb | AwsRemoteOptionsAlb[];
};

export interface AwsRemoteTerraformHookArgs extends JsonObject {
  options: AwsRemoteOptions;
  state: TerraformState;
  vpc(name?: string): Resource | undefined;
  alb(name?: string): Resource | undefined;
}
