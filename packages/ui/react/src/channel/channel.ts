import { EventEmitter } from 'events';

import type { JsonObject } from '@backyard/types';

export class Channel extends EventEmitter {
  guid = Math.random().toString();

  readonly #token: string;

  constructor(readonly parent: Window, readonly origin: string, token: string) {
    super();
    this.#token = token;
  }

  get token(): string {
    return this.#token;
  }

  onMessage = (type: string, payload: JsonObject) => {
    this.emit(type, payload);
  };

  sendMessage(type: string, payload: JsonObject): void {
    console.log('channel send message', this.#token);

    this.parent.postMessage(
      JSON.stringify({ type, payload, token: this.#token }),
      this.origin,
    );
  }
}
