import type { DeepRequired } from 'ts-essentials';
import type { Configuration as WebpackConfiguration } from 'webpack';

import type { JsonObject } from '../scalar';
import type { ServiceName } from '../service';
import type { Context } from '../context';

import { ConfigurationServiceAuthSettings } from './service-settings';

export type ConfigurationPluginOptions = JsonObject;

export type ConfigurationPlugin = string | [string, ConfigurationPluginOptions];

export interface ConfigurationServiceGateway {
  enabled: boolean;
  name?: string;
  url?: string;
  stripPath?: boolean;
  routes?: Array<{
    name: string;
    strip_path: boolean;
    paths: string[];
  }>;
  plugins?: Array<{
    name: string;
    config?: JsonObject;
  }>;
}

export interface ConfigurationServiceContainer {
  enabled?: boolean;
  externalPort?: number;
  externalHost?: string;
  port?: number;
  host?: string;
  name?: string;
  imageName?: string;
  environment?: Record<string, string>;
  volumes?: Array<[string, string]>;
  command?: string[];
  build?: {
    context: string;
  };
  essential?: boolean;
  meta?: JsonObject;
}

export interface ConfigurationService<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
> {
  name: ServiceName;
  enabled?: boolean;
  version?: number;
  provider?: string;
  platform?: string;
  comment?: string;
  settings?: Settings;
  gateway?: ConfigurationServiceGateway;
  container?: ConfigurationServiceContainer;
  dependencies?: Array<string>;
}

export type ConfigurationServiceOptions =
  | ConfigurationService
  | {
      name: 'auth';
      provider?: string;
      settings?: ConfigurationServiceAuthSettings;
    };

export interface ConfigurationServiceSettings extends JsonObject {}

export type ConfigurationSite = {
  name: string;
  entry: Record<string, string>;
  webpack?(config: WebpackConfiguration, context: Context): void;
};

export type ConfigurationResolve = {
  backyard?: string;
  source?: string;
  modules?: string[];
};
export type Configuration = {
  root?: string;
  resolve?: ConfigurationResolve;
  services?: ConfigurationServiceOptions[];
  sites?: ConfigurationSite[];
  platform?: {
    local?: string;
    remote?: string;
  };
};

export type FullConfiguration = DeepRequired<Configuration> & {
  _configFileRoot?: string;
};
