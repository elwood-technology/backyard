import type * as filesystem from 'fs-jetpack';
import type { default as which } from 'which';

import {
  FullConfiguration,
  ConfigurationSite,
  ConfigurationService,
  ConfigurationServiceContainer,
  ConfigurationServiceSettings,
  ConfigurationServiceGateway,
} from './configuration';
import { Json, JsonObject } from './scalar';
import { ServiceHooks, ServiceName } from './service';
import { RemotePlatform, LocalPlatform } from './platform';

export type ContextMode = 'local' | 'remote';

export interface ContextServiceContainer extends ConfigurationServiceContainer {
  enabled: boolean;
}

export interface ContextService<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
> {
  name: string;
  type?: string;
  moduleRootPath: string;
  apiModulePath?: string;
  uiModulePath?: string;
  config: ConfigurationService<Settings>;
  init(): Promise<void>;
  gateway: ConfigurationServiceGateway | undefined;
  container: ConfigurationServiceContainer | undefined;
  stage(dir: string): Promise<void>;
  hook(name: string, args?: JsonObject): Promise<Json>;
  platform?: {
    gateway: ConfigurationServiceGateway | undefined;
    container: ConfigurationServiceContainer | undefined;
    stage(dir: string): Promise<void>;
    hook(name: string, args?: JsonObject): Promise<Json>;
  };
  getHooks(): ServiceHooks;
  getPlatformHooks(): ServiceHooks;
  setPlatformHooks(hooks: ServiceHooks): void;
}

export interface ContextSite {
  name: string;
  config: ConfigurationSite;
  moduleRootPath: string;
  port: number;
}

export type ContextServicesMap = Map<ServiceName, ContextService>;
export type ContextSitesMap = Map<string, ContextSite>;

export interface Context {
  mode: ContextMode;
  dir: {
    cwd: string;
    root: string;
    backyard: string;
    stage: string;
    source: string;
    state: string;
  };
  config: FullConfiguration;
  sitesMap: ContextSitesMap;
  services: ContextServicesMap;
  keys: {
    anon: string;
    service: string;
  };
  platforms: {
    local: LocalPlatform;
    remote: RemotePlatform;
  };
  tools: {
    filesystem: typeof filesystem;
    which: typeof which;
  };
  settings: JsonObject & {
    certPath?: string;
    certKeyPath?: string;
  };
  log(msg: string): void;
  createDbUrl(): string;
  addService(config: ConfigurationService): Promise<void>;
  serviceExternalUrl(name: string): string;
  serviceInternalUrl(name: string): string;
}
