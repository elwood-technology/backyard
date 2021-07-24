import { createContext, useContext } from 'react';

import { ChannelType } from '../types';

export const ChannelContext = createContext<ChannelType | null>(null);

export const ChannelProvider = ChannelContext.Provider;
export const ChannelConsumer = ChannelContext.Consumer;

export function useChannel(): ChannelType | null {
  return useContext(ChannelContext);
}
