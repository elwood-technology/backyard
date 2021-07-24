import { useContext, useEffect, useState } from 'react';

import { invariant } from 'ts-invariant';

import type {
  ServicesServiceState,
  ServicesState,
  ServicesStateContextValue,
} from './types';

import { ServicesContext } from './context';

export function useServicesState(): ServicesState {
  const state = useContext<ServicesStateContextValue>(ServicesContext);
  invariant(state, 'ServiceStateProvider must be used inside a component.');
  return state[0];
}

export function useServicesStateDispatch(): ServicesStateContextValue[1] {
  const state = useContext<ServicesStateContextValue>(ServicesContext);
  invariant(state, 'ServiceStateProvider must be used inside a component.');
  return state[1];
}

export function useServicesStateService(name: string): ServicesServiceState {
  const state = useServicesState();
  const service = state.services.find((service) => service.name === name);
  invariant(service, `Service ${name} not found`);
  return service;
}

export function userServiceDisplayName(name: string): string {
  const state = useServicesState();

  const [value, setValue] = useState('...');

  useEffect(() => {
    const service = state.services.find((service) => service.name === name);

    if (service?.displayName) {
      setValue(service?.displayName);
    }
  }, [state.lastUpdate]);

  return value;
}
