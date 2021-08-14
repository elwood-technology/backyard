import type {
  ConfigurationServiceSettings,
  ContextService,
  JsonObject,
} from '@backyard/types';

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

export interface KongKeys {
  anonymousKey: string;
  serviceKey: string;
}

export interface KongServiceSettings extends ConfigurationServiceSettings {
  jwt: {
    iat?: number;
    secret?: string;
    groupName?: string;
    exp?: number;
  };
  anonymousKey: string;
  serviceKey: string;
}

export type KongContextService = ContextService<KongServiceSettings>;
