import type { DeepRequired } from 'ts-essentials';

import type { JsonObject } from './scalar';
import type { ServiceName } from './service';

export interface ConfigurationModuleOptions extends JsonObject {
  resolve?: string;
  plugins?: string[];
}

export type ConfigurationModule<
  Options extends ConfigurationModuleOptions = ConfigurationModuleOptions,
> = string | [string] | Options | [Options] | [string, Options];

export type ConfigurationPlatform = {
  local?: ConfigurationModule;
  remote?: ConfigurationModule;
};

export interface ConfigurationServiceGateway {
  gatewayName?: string;
  enabled: boolean;
  url?: string;
  prefix?: string;
  stripPath?: boolean;
  urlPath?: string;
  routes?: Array<{
    name: string;
    strip_path: boolean;
    paths: string[];
    plugins?: JsonObject[];
  }>;
  plugins?: Array<{
    name: string;
    config?: JsonObject;
  }>;
  additional?: ConfigurationServiceGateway[];
}

export interface ConfigurationServiceContainer {
  enabled?: boolean;
  externalPort?: number;
  externalHost?: string;
  port?: number;
  host?: string;
  name?: string;
  imageName?: string;
  restart?: 'on-failure' | 'always' | 'no' | 'unless-stopped';
  environment?: Record<string, string>;
  volumes?: Array<[string, string]>;
  command?: string[];
  build?: {
    context: string;
  } & JsonObject;
  essential?: boolean;
  meta?: JsonObject;
}

export interface ConfigurationServiceProviderOptions
  extends ConfigurationModuleOptions {
  extends?: ConfigurationModule;
}

export interface ConfigurationService<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
> {
  name?: ServiceName;
  enabled?: boolean;
  version?: number;
  provider?: ConfigurationModule<ConfigurationServiceProviderOptions>;
  platform?: ConfigurationPlatform;
  comment?: string;
  settings?: Settings;
  gateway?: ConfigurationServiceGateway;
  container?: ConfigurationServiceContainer;
  dependencies?: Array<string>;
}

export interface ConfigurationServiceSettings extends JsonObject {}

export type ConfigurationResolve = {
  backyard?: string;
  source?: string;
  modules?: string[];
};

export type Configuration = {
  root?: string;
  resolve?: ConfigurationResolve;
  services?: ConfigurationService[];
  platform?: ConfigurationPlatform;
};

export type FullConfiguration = DeepRequired<Configuration> & {
  _configFileRoot?: string;
};
