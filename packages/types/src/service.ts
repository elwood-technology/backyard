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

export interface ServiceHookProviderArgs<
  Service extends ContextService = ContextService,
  Parent = Json,
> extends JsonObject {
  context: Context;
  service: Service;
  parent?: Parent;
}

export type ServiceHookProvider<A extends JsonObject = JsonObject, R = Json> = (
  args: ServiceHookProviderArgs & A,
) => Promise<R>;

export interface ServiceHooks {
  config?(
    context: Context,
    config: ConfigurationService,
  ): Promise<Partial<ConfigurationService>>;
  init?(context: Context, service: ContextService): Promise<void>;
  stage?: ServiceHookProvider<{ dir: string }>;
  gateway?: ServiceGatewayProvider;
  container?: ServiceContainerProvider;
  hooks?: Record<string, ServiceHookProvider>;
}
