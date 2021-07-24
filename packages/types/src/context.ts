import {
  FullConfiguration,
  ConfigurationService,
  ConfigurationServiceRealtimeSettings,
  ConfigurationServiceKongSettings,
  ConfigurationServiceAuthSettings,
  ConfigurationServiceDatabaseSettings,
  ConfigurationServiceStorageSettings,
  ConfigurationServiceRestSettings,
  ConfigurationServiceDevServerSettings,
  ConfigurationSite,
} from './configuration';

import { ServiceName } from './service';

export type ContextMode = 'dev' | 'build';

export interface ContextService<
  Config extends ConfigurationService = ConfigurationService,
> {
  name: string;
  type: 'local' | 'package';
  moduleRootPath: string;
  apiModulePath?: string;
  uiModulePath?: string;
  config: Config;
}

export interface ContextSite {
  name: string;
  config: ConfigurationSite;
  moduleRootPath: string;
  port: number;
}

export type ContextUserServicesMap = Map<ServiceName, ContextService>;
export type ContextSitesMap = Map<string, ContextSite>;

export interface ContextCoreServicesSettingsMap {
  kong: Required<ConfigurationServiceKongSettings>;
  auth: Required<ConfigurationServiceAuthSettings>;
  db: Required<ConfigurationServiceDatabaseSettings>;
  storage: Required<ConfigurationServiceStorageSettings>;
  rest: Required<ConfigurationServiceRestSettings>;
  realtime: Required<ConfigurationServiceRealtimeSettings>;
  devServer?: Required<ConfigurationServiceDevServerSettings>;
}

export interface Context {
  mode: ContextMode;
  dir: {
    cwd: string;
    root: string;
    backyard: string;
    dest: string;
    source: string;
  };
  config: FullConfiguration;
  dbUri: string;
  sitesMap: ContextSitesMap;
  userServices: ContextUserServicesMap;
  coreServiceSettings: ContextCoreServicesSettingsMap;
  keys: {
    anon: string;
    service: string;
  };
}
