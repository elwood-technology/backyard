import TerraformPlugin, {
  TerraformState,
  Resource,
} from '@backyard/plugin-terraform';
import { JsonObject } from 'packages/types/src/scalar';

export type AwsRemotePlugins = {
  terraform: typeof TerraformPlugin;
};

export type AwsRemoteOptions = {
  profile: string;
  region: string;
  vpc?: {
    name: string;
    subnetCount?: number;
  };
};

export interface AwsRemoteTerraformHookArgs extends JsonObject {
  options: AwsRemoteOptions;
  state: TerraformState;
  vpc(): Resource | undefined;
}
