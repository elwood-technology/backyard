import { createContext, useContext, useState } from 'react';

export type LaunchState = {
  open: boolean;
  toggleOpen(): void;
  setOpen(open: boolean): void;
};

export const LaunchStateContext = createContext<LaunchState>({
  open: false,
  toggleOpen() {},
  setOpen() {},
});

export const LaunchStateProvider = LaunchStateContext.Provider;
export const LaunchStateConsumer = LaunchStateContext.Consumer;

export function useLaunchStateContext(): LaunchState {
  const [open, setOpen] = useState<boolean>(false);

  return {
    open,
    toggleOpen() {
      setOpen(!open);
    },
    setOpen,
  };
}

export function useLaunchState(): LaunchState {
  return useContext(LaunchStateContext);
}
