import React, { lazy, Suspense, ComponentType } from 'react';
import { render } from 'react-dom';

import type { JsonObject } from '@backyard/types';

import { CanvasProvider } from './canvas';
import { Channel } from './channel';
import { ChannelType } from './types';

export type UiReactCreateServiceCanvasFactory = {
  default: ComponentType<any>;
};

export type UiReactCreateServiceOptions = {
  title?: string;
  before?(): Promise<void>;
  after?(): Promise<void>;
  canvas(): Promise<UiReactCreateServiceCanvasFactory>;
  data(): Promise<any>;
};

type EventMessage = {
  type: string;
  payload: JsonObject;
  token: string;
};

function parseEvent(data: string): EventMessage | undefined {
  if (typeof data !== 'string') {
    return;
  }

  const { type, token, payload = {} } = JSON.parse(data) as EventMessage;

  return {
    type,
    payload,
    token,
  };
}

let currentChannel: Channel | undefined = undefined;

/**
 *
 * @param options UiReactCreateServiceOptions
 *
 * import { createService } from '@backup/ui/react';
 * createService({
 *  canvas: () => import('./canvas'),
 *  data: () => import('./channel'),
 * })
 */
export async function createService(
  options: UiReactCreateServiceOptions,
): Promise<void> {
  if (typeof options.before === 'function') {
    await options.before();
  }

  const { origin, sharedToken } = JSON.parse(
    decodeURIComponent(window.location.hash.substring(1)),
  );

  if (!origin) {
    throw new Error('No origin in URL');
  }

  if (!sharedToken) {
    throw new Error('No sharedToken in URL');
  }

  window.addEventListener('message', (inboundEvent) => {
    try {
      const event = parseEvent(inboundEvent.data);

      if (!event) {
        return;
      }

      const { type, payload, token } = event;

      function createChannel(): Channel {
        if (!payload.token) {
          throw new Error('No Token');
        }

        if (currentChannel) {
          throw new Error('Handle has already rendered');
        }

        return (currentChannel = new Channel(
          window.parent,
          origin,
          payload.token,
        ));
      }

      if (type === 'canvas.render') {
        return renderCanvas(options.canvas, createChannel());
      }

      if (type === 'data.init') {
        createChannel();

        if (options.title && currentChannel) {
          currentChannel.sendMessage('set-display-title', {
            title: options.title,
          });
        }

        return;
      }

      if (!currentChannel) {
        throw new Error('No Channel Exists');
      }

      if (currentChannel.token !== token) {
        throw new Error(`Invalid token ${currentChannel.token} != ${token}`);
      }

      currentChannel.onMessage(type, payload);
    } catch (err) {
      console.log(err.message);
    }
  });

  parent.postMessage(
    JSON.stringify({
      type: 'ready',
    }),
    origin,
  );
}

function getRootElement(): HTMLDivElement {
  const currentRoot = document.querySelector<HTMLDivElement>('#root');

  if (!currentRoot) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    return root;
  }

  return currentRoot;
}

export function renderCanvas(
  factory: () => Promise<UiReactCreateServiceCanvasFactory>,
  channel: ChannelType,
): void {
  const Canvas = lazy(factory);

  render(
    <Suspense fallback={<div />}>
      <CanvasProvider channel={channel}>
        <Canvas />
      </CanvasProvider>
    </Suspense>,
    getRootElement(),
  );
}

export function initDataChannel(): void {}
