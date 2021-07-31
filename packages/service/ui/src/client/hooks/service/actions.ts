import { createElement, createRef } from 'react';

import { v4 as uuid } from 'uuid';

import type { Json } from '@backyard/types';

import { IconView } from '../../components';
import {
  ServicesState,
  ServicesStateActionType,
  ServicesStateActionAddServicePayload,
  ServicesStateActionSetShortcutsPayload,
  ServicesStateActionSetMenuPayload,
} from './types';

export type ServiceEventHandler = (
  state: ServicesState,
  payload: any,
  serviceName: string | undefined,
) => ServicesState;

export const actions: Record<ServicesStateActionType, ServiceEventHandler> = {
  ready: (state) => state,
  'add-service': addService,
  'set-shortcuts': setShortcuts,
  'inbound-message': (state) => state,
  'set-display-title': setDisplayTitle,
  'set-icon': (state) => state,
  'uri-change': (state) => state,
  'set-menu': setMenu,
};

export function addService(
  state: ServicesState,
  payload: ServicesStateActionAddServicePayload,
): ServicesState {
  const current = state.services.find((item) => item.name === payload.name);

  if (current) {
    return state;
  }

  const canvasRef = createRef<HTMLIFrameElement>();
  const dataRef = createRef<HTMLIFrameElement>();
  const channelExchangeToken = uuid();
  const serviceInBackyardState = state.backyardStateServices.find(
    (item) => item.name === payload.name,
  );
  const scriptUrl = serviceInBackyardState?.scriptUrl ?? 'main.js';
  const channelUrl =
    serviceInBackyardState?.frameUrl ??
    'https://backyard-public.s3.us-west-1.amazonaws.com/public-channel-v0.html?asdasd';

  function sendMessage(
    to: 'data' | 'canvas',
    type: string,
    payload: Json = {},
  ) {
    if (!['data', 'canvas'].includes(to)) {
      console.log('Trying to send to invalid frame %s', to);
      return;
    }

    const frame = to === 'data' ? dataRef.current : canvasRef.current;

    console.log(
      'Send Message to %s. %s(%o) %s',
      to,
      type,
      payload,
      new URL(channelUrl).origin,
    );

    frame!.contentWindow?.postMessage(
      JSON.stringify({
        type,
        payload: payload,
        token: channelExchangeToken,
      }),
      new URL(channelUrl).origin,
    );
  }

  return {
    ...state,
    services: [
      ...state.services,
      {
        ...payload,
        canvasRef,
        dataRef,
        channelExchangeToken,
        channelUrl,
        scriptUrl,
        sendMessage,
      },
    ],
  };
}

export function setShortcuts(
  state: ServicesState,
  payload: ServicesStateActionSetShortcutsPayload,
  serviceName: string = '',
): ServicesState {
  const { shortcuts } = payload;

  const nextShortcuts = shortcuts.map((item) => {
    const href = item.href.replace(/^\//, '');
    item.href = `/${serviceName}/${href}`;

    if (item.icon) {
      return {
        ...item,
        icon: createElement(IconView, { name: item.icon }),
      };
    }

    return item;
  });

  return {
    ...state,
    services: state.services.map((item) => {
      if (item.name === serviceName) {
        return {
          ...item,
          shortcuts: nextShortcuts,
        };
      }

      return item;
    }),
  };
}

export function setDisplayTitle(
  state: ServicesState,
  payload: ServicesStateActionSetShortcutsPayload,
  serviceName: string = '',
): ServicesState {
  const { title } = payload;

  return {
    ...state,
    services: state.services.map((item) => {
      if (item.name === serviceName) {
        return {
          ...item,
          displayName: title,
        };
      }

      return item;
    }),
  };
}

export function setMenu(
  state: ServicesState,
  payload: ServicesStateActionSetMenuPayload,
  serviceName: string = '',
): ServicesState {
  const { menu } = payload;

  const next = menu.map((item) => {
    const href = item.href.replace(/^\//, '');
    item.href = `/${serviceName}/${href}`;

    return item;
  });

  return {
    ...state,
    services: state.services.map((item) => {
      if (item.name === serviceName) {
        return {
          ...item,
          menu: next,
        };
      }

      return item;
    }),
  };
}
