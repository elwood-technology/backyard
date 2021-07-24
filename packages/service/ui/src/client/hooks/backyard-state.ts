import { useEffect, useState } from 'react';

import { invariant } from 'ts-invariant';

export type BackyardStateServiceFrame = {
  name: string;
  frameUrl: string;
  scriptUrl: string;
};

export type BackyardState = {
  workspaceLogoUrl: string;
  workspaceTitle: string;
  gatewayBaseUrl: string;
  apiAnonKey: string;
  serviceFrames: BackyardStateServiceFrame[];
};

export function useBackyardState(): BackyardState | undefined {
  const win = window as unknown as {
    BACKYARD_STATE?: BackyardState;
  };
  const [state, setState] = useState<BackyardState | undefined>(
    win.BACKYARD_STATE,
  );

  useEffect(() => {
    setState(win.BACKYARD_STATE);
  }, [win.BACKYARD_STATE]);

  return state;
}

function getFromState<T>(
  key: keyof BackyardState,
  state: BackyardState | undefined,
): T {
  invariant(state, `No "${key}" in state`);
  invariant(state[key], `No "${key}" in state`);
  return state[key] as unknown as T;
}

export function useBackyardStateGatewayBaseUrl(): string {
  return getFromState('gatewayBaseUrl', useBackyardState());
}

export function useBackyardStateApiAnonKey(): string {
  return getFromState('apiAnonKey', useBackyardState());
}

export function useBackyardStateWorkspaceLogoUrl(): string {
  return (
    useBackyardState()?.workspaceLogoUrl ??
    'https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg'
  );
}

export function useBackyardStateWorkspaceTitle(): string {
  return useBackyardState()?.workspaceTitle ?? 'Workspace';
}
