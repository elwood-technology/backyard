import React, { PropsWithChildren, useEffect } from 'react';

import { ChannelType } from '../types';
import { ChannelProvider } from '../channel';

import { CanvasRouter } from './router';

export interface CanvasProviderProps {
  channel: ChannelType;
}

export function CanvasProvider(
  props: PropsWithChildren<CanvasProviderProps>,
): JSX.Element {
  useEffect(() => {});

  return (
    <ChannelProvider value={props.channel}>
      <CanvasRouter>{props.children}</CanvasRouter>
    </ChannelProvider>
  );
}
