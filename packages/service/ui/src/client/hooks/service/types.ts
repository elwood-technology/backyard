import type { Dispatch, RefObject } from 'react';

import type { JsonObject, Json } from '@backyard/types';

import type { MenuItem } from '../../types';
import { BackyardStateServiceFrame } from '../backyard-state';

export type ServicesServiceState = {
  name: string;
  shortcuts: MenuItem[];
  displayName?: string;
  menuVisible?: boolean;
  channelUrl?: string;
  scriptUrl?: string;
  canvasRef?: RefObject<HTMLIFrameElement>;
  dataRef?: RefObject<HTMLIFrameElement>;
  channelExchangeToken?: string;
  menu?: MenuItem[];
  sendMessage(to: 'data' | 'canvas', type: string, payload?: Json): void;
};

export type ServicesState = {
  lastUpdate?: number;
  error?: Error;
  services: ServicesServiceState[];
  backyardStateServices: BackyardStateServiceFrame[];
};

export type ServicesStateActionType =
  | 'ready'
  | 'inbound-message'
  | 'add-service'
  | 'set-shortcuts'
  | 'set-display-title'
  | 'set-menu'
  | 'set-icon'
  | 'uri-change';

export interface ServicesStateActionSetShortcutsMenuItem
  extends Omit<MenuItem, 'icon'> {
  icon: string;
  path: string;
}

export interface ServicesStateActionAddServicePayload
  extends JsonObject,
    ServicesServiceState {}

export interface ServicesStateActionSetShortcutsPayload extends JsonObject {
  shortcuts: ServicesStateActionSetShortcutsMenuItem[];
}

export interface ServicesStateActionSetDisplayTitle extends JsonObject {
  title: string;
}

export interface ServicesStateActionSetIcon extends JsonObject {
  icon: string;
}

export interface ServicesStateActionSetMenuPayload extends JsonObject {
  menu: MenuItem[];
}

export type ServicesStateAction<T extends ServicesStateActionType, P> = {
  type: T;
  payload: P;
  serviceName?: string;
};

export type ServicesStateActions =
  | { type: ServicesStateActionType; payload: JsonObject; serviceName?: string }
  | ServicesStateAction<'ready', JsonObject>
  | ServicesStateAction<'add-service', ServicesStateActionAddServicePayload>
  | ServicesStateAction<'set-shortcuts', ServicesStateActionSetShortcutsPayload>
  | ServicesStateAction<'set-menu', ServicesStateActionSetMenuPayload>
  | ServicesStateAction<
      'set-display-title',
      ServicesStateActionSetDisplayTitle
    >;

export type ServicesStateContextValue = [
  ServicesState,
  Dispatch<ServicesStateActions>,
];
