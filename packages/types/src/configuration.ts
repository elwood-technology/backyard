import type { DeepRequired } from 'ts-essentials';
import type { Configuration as WebpackConfiguration } from 'webpack';

import type { JsonObject } from './scalar';
import type { CoreServiceName, ServiceName } from './service';
import type { Context } from './context';

export type ConfigurationPluginOptions = JsonObject;

export type ConfigurationPlugin = string | [string, ConfigurationPluginOptions];

export interface ConfigurationService {
  name: ServiceName;
  version?: number;
  provider: string;
  platform: 'aws:lambda';
  comment?: string;
  settings?: JsonObject;
}

export interface ConfigurationServiceDevServerSettings extends JsonObject {
  port?: number;
  containerPort?: number;
  containerHost?: string;
  watch?: boolean;
  watchPaths?: string[];
  sites?: boolean;
}

export interface ConfigurationServiceStorageSettings extends JsonObject {
  port?: number;
  containerPort?: number;
  containerHost?: string;
  projectRef?: string;
  aws: {
    bucket: string;
    region: string;
    key: string;
    secret: string;
  };
}

export interface ConfigurationServiceDatabaseSettings extends JsonObject {
  host: string;
  port: number;
  containerPort?: number;
  containerHost?: string;
  password: string;
  name: string;
  user: string;
}

export interface ConfigurationServiceAuthSettings extends JsonObject {
  host?: string;
  port?: number;
  containerPort?: number;
  containerHost?: string;
  externalUrl?: string;
  disableSignUp?: boolean;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export interface ConfigurationServiceRestSettings extends JsonObject {
  port?: number;
  containerPort?: number;
  containerHost?: string;
}

export interface ConfigurationServiceKongSettings extends JsonObject {
  port?: number;
  containerPort?: number;
  containerHost?: string;
  tlsPort?: number;
}

export interface ConfigurationServiceRealtimeSettings extends JsonObject {
  port?: number;
  containerPort?: number;
  containerHost?: string;
}

export type ConfigurationServiceCoreSettings =
  | ConfigurationServiceAuthSettings
  | ConfigurationServiceDatabaseSettings
  | ConfigurationServiceKongSettings
  | ConfigurationServiceRestSettings
  | ConfigurationServiceRealtimeSettings
  | ConfigurationServiceDevServerSettings
  | ConfigurationServiceStorageSettings;

export interface ConfigurationServiceCore<
  S = ConfigurationServiceCoreSettings,
> {
  name: CoreServiceName;
  settings: S;
}

export type ConfigurationJwt = {
  secret?: string;
  groupName?: string;
  exp?: number;
};

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
  operatorToken?: string;
  jwt?: ConfigurationJwt;
  services?: Array<ConfigurationService | ConfigurationServiceCore>;
  sites?: ConfigurationSite[];
  plugins?: ConfigurationPlugin[];
};

export type FullConfiguration = DeepRequired<Configuration>;
