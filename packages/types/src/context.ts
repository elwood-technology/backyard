import type * as filesystem from 'fs-jetpack';
import type { default as which } from 'which';

import {
  FullConfiguration,
  ConfigurationService,
  ConfigurationServiceContainer,
  ConfigurationServiceSettings,
  ConfigurationServiceGateway,
} from './configuration';
import { Json, JsonObject } from './scalar';
import { ServiceHooks, ServiceName } from './service';
import { RemotePlatform, LocalPlatform, Platform } from './platform';

export type ContextMode = 'local' | 'remote';

export interface ContextServiceContainer extends ConfigurationServiceContainer {
  enabled: boolean;
}

export interface ContextService<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
> {
  name: string;
  provider: string;
  type?: string;
  moduleRootPath: string;
  apiModulePath?: string;
  uiModulePath?: string;
  config: ConfigurationService<Settings>;
  init(): Promise<void>;
  finalize(): Promise<void>;
  gateway: ConfigurationServiceGateway | undefined;
  container: ConfigurationServiceContainer | undefined;
  stage(dir: string): Promise<void>;
  hook<R = Json>(name: string, args?: JsonObject): Promise<R>;
  platform?: {
    gateway: ConfigurationServiceGateway | undefined;
    container: ConfigurationServiceContainer | undefined;
    stage(dir: string): Promise<void>;
    hook(name: string, args?: JsonObject): Promise<Json>;
  };
  getHooks(): ServiceHooks;
  getPlatform(): Platform;
  getGatewayUrl(): string;
  getContainerUrl(): string;
  getContext(): Context;
}

export type ContextServicesMap = Map<ServiceName, ContextService>;

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
  services: ContextServicesMap;
  platforms: {
    local: ContextPlatform & LocalPlatform;
    remote?: ContextPlatform & RemotePlatform;
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
  addService(config: ConfigurationService): Promise<ContextService>;
  getService(name: string): ContextService;
}

export interface ContextPlatform {
  type: 'local' | 'remote';
  platform: Platform;
  hook<Result = Json>(
    context: Context,
    name: string,
    args: JsonObject,
  ): Promise<Result>;
}
