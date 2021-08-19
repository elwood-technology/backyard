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
import { Platform, PlatformLocalHooks, PlatformRemoteHooks } from './platform';

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
  settings: Settings;
  init(): Promise<void>;
  finalize(): Promise<void>;
  gateway: ConfigurationServiceGateway | undefined;
  container: ConfigurationServiceContainer | undefined;
  stage(dir: string): Promise<void>;
  hook<R = Json>(name: string, args?: JsonObject): Promise<R>;
  platform?: ContextPlatform<ContextPlatformTypeName, string>;
  getHooks(): ServiceHooks;
  getExtendedHooks(): ServiceHooks;
  getPlatform(): ContextPlatform<ContextPlatformTypeName, string> | undefined;
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
    source?: string;
    state: string;
  };
  config: FullConfiguration;
  services: ContextServicesMap;
  platforms: {
    local: ContextPlatformLocal;
    remote?: ContextPlatformRemote;
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

export type ContextPlatformTypeName = ContextMode;

export interface ContextPlatform<
  T extends ContextPlatformTypeName,
  Hooks extends string,
> {
  platform: Platform;
  plugins: Record<string, Json>;
  init(): Promise<void>;
  setContext(context: Context): void;
  getOptions(): JsonObject;
  type: T;
  config(
    context: Context,
    config: ConfigurationService,
  ): Promise<ConfigurationService>;
  executeHook<Result = Json>(name: Hooks, args: JsonObject): Promise<Result>;
}

export type ContextPlatformLocal = ContextPlatform<'local', PlatformLocalHooks>;

export type ContextPlatformRemote = ContextPlatform<
  'remote',
  PlatformRemoteHooks
>;
