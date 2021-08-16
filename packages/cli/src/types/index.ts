import type { GluegunToolbox } from 'gluegun';
import type { TerraformGenerator, Resource } from 'terraform-generator';

import type {
  JsonObject,
  Context,
  ContextMode,
  ConfigurationServiceContainer,
} from '@backyard/types';

export interface DockerComposeService {
  container_name: string;
  image?: string;
  working_dir?: string;
  build?: { context: string };
  environment?: Record<string, string | number>;
  ports?: Array<string | number>;
  volumes?: string[];
  command?: string[];
  depends_on?: string[];
  restart?: 'always' | 'never' | 'on-failure';
}

export interface Toolbox extends GluegunToolbox {
  createContext: (mode: ContextMode) => Promise<Context>;
  context: Context;
  prepareStage: () => Promise<void>;
  appendDockerComposeToStage: (
    services: ConfigurationServiceContainer[],
  ) => Promise<void>;
  errorBox(err: Error): void;
  rc: {
    dir: string;
    config: JsonObject & {
      file: string;
    };
    cloud: JsonObject & {
      file: string;
    };
  };
}

export interface InfrastructureState {
  profile: string;
  region: string;
  tf: TerraformGenerator;
  alb: Resource;
  vpc: Resource;
  albSecurityGroup: Resource;
  logGroup: Resource;
  subnets: {
    public: Resource;
    private: Resource;
  };
}

export interface EcrTaskDefinition {
  cpu: number;
  image: string;
  memory: number;
  name: string;
  networkMode: 'awsvpc';
  logConfiguration: {
    logDriver: string;
    options: JsonObject;
  };
  environment: Array<{ name: string; value: string }>;
  portMappings: Array<{
    containerPort: number;
    hostPort: number;
  }>;
}
