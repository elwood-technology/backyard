import { IncomingMessage, IncomingHttpHeaders } from 'http';

import { Json } from './scalar';

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
  backyard: {
    services: Array<{
      name: string;
      version: number;
      comment?: string;
    }>;
  };
};
export type ServiceResponse = {
  type?: 'text' | 'json' | 'yml';
  code?: number;
  body: Json;
  headers?: IncomingHttpHeaders;
};

export type ServiceHandler = (req: ServiceRequest) => Promise<ServiceResponse>;
