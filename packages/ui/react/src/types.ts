import type { EventEmitter } from 'events';
import type { JsonObject } from '@backyard/types';

export interface ChannelType extends EventEmitter {
  guid: string;
  onMessage(type: string, payload: JsonObject): void;
  sendMessage(type: string, payload: JsonObject): void;
}
