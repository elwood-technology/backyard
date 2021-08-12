// ATTRIBUTION: https://github.com/dougmoscrop/serverless-http

import { IncomingMessage } from 'http';
import { Socket } from 'net';

export type RequestArgs = {
  method: string;
  url: string;
  headers: IncomingMessage['headers'];
  body: string;
  remoteAddress: string;
};

export class Request extends IncomingMessage {
  constructor(args: RequestArgs) {
    super(new Socket());

    const { method, url, headers, body, remoteAddress } = args;

    Object.assign(this, {
      ip: remoteAddress,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method,
      headers,
      body,
      url,
    });

    this._read = () => {
      this.push(body);
      this.push(null);
    };
  }
}
