import { IncomingMessage, IncomingHttpHeaders } from 'http';

import {
  ConfigurationService,
  ConfigurationServiceContainer,
  ConfigurationServiceGateway,
} from './configuration';
import { Context, ContextService } from './context';

import { Json, JsonObject } from './scalar';

export type CoreServiceName =
  | 'kong'
  | 'auth'
  | 'storage'
  | 'rest'
  | 'db'
  | 'devServer';
export type ServiceName = CoreServiceName | string;

export type ServiceRequest = {
  request: IncomingMessage;
};
export type ServiceResponse = {
  type?: 'text' | 'json' | 'yml';
  code?: number;
  body: Json;
  headers?: IncomingHttpHeaders;
};

export type ServiceHandler = (req: ServiceRequest) => Promise<ServiceResponse>;

export type ServiceGatewayProvider = (
  context: Context,
  config?: ConfigurationServiceGateway,
) => Promise<ConfigurationServiceGateway>;

export type ServiceContainerProvider = (
  context: Context,
  config?: ConfigurationServiceContainer,
) => Promise<ConfigurationServiceContainer>;

export type ServiceStageProvider = (
  dir: string,
  context: Context,
  config?: ConfigurationService,
) => Promise<void>;

export interface ServiceHookProviderArgs extends JsonObject {
  context: Context;
  service: ContextService;
  parent?: Json;
}

export type ServiceHookProvider = (
  args: ServiceHookProviderArgs,
) => Promise<Json>;

export interface ServiceHooks {
  config?(
    context: Context,
    config: ConfigurationService,
  ): Promise<Partial<ConfigurationService>>;
  init?(context: Context, service: ContextService): Promise<void>;
  stage?: ServiceStageProvider;
  gateway?: ServiceGatewayProvider;
  container?: ServiceContainerProvider;
  hooks?: Record<string, ServiceHookProvider>;
}
