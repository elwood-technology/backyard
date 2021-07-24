import type { GluegunToolbox } from 'gluegun';
import type { TerraformGenerator, Resource } from 'terraform-generator';

import type { JsonObject, Context, ContextMode } from '@backyard/types';

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

export interface KongService {
  name: string;
  _comment: string;
  url?: string;
  routes: Array<{ name: string; strip_path: boolean; paths: string[] }>;
  plugins: Array<{
    name: string;
    config?: JsonObject;
  }>;
}

export interface KongConfig {
  _format_version: '1.1';
  services: KongService[];
  consumers: Array<{ username: string; keyauth_credentials: JsonObject }>;
}

export interface Toolbox extends GluegunToolbox {
  createContext: (mode: ContextMode) => Promise<Context>;
  context: Context;
  prepareDest: () => Promise<void>;
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
