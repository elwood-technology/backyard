import type { Context } from 'aws-lambda';

import type { JsonObject, ServiceHandler } from '@backyard/types';

import { Request } from './request';

type Event = {
  request_body: any;
  request_body_args: any;
  request_headers: any;
  request_method: string;
  request_uri: string;
};

type Handler = (event: Event, Context: Context) => Promise<JsonObject>;

export const typeToContentType = {
  json: 'application/json',
  text: 'text/plain',
  html: 'text/html',
  yml: 'application/yaml',
};

export function createHandler(service: { handler: ServiceHandler }): {
  handler: Handler;
} {
  return {
    async handler(event: Event) {
      const request = new Request({
        body: event.request_body,
        url: event.request_uri,
        method: event.request_method,
        remoteAddress: '',
        headers: event.request_headers,
      });

      const result = await service.handler({
        request,
      });

      const type = result.type ?? 'json';
      const contentType =
        type in typeToContentType
          ? typeToContentType[type]
          : typeToContentType['json'];

      return {
        statusCode: result.code ?? 200,
        header: {
          'Content-Type': contentType,
          ...(result.headers || {}),
        },
        body: result.body,
      };
    },
  };
}
