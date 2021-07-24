import { createContext, useEffect, useReducer, Reducer } from 'react';

import type {
  ServicesState,
  ServicesServiceState,
  ServicesStateContextValue,
  ServicesStateActions,
} from './types';
import { serviceStateReducer } from './reducer';
import { useBackyardState } from '../backyard-state';

export const initialServiceState: ServicesState = {
  services: [],
  backyardStateServices: [],
};

export const ServicesContext = createContext<ServicesStateContextValue>([
  initialServiceState,
  () => ({}),
]);

export const ServicesStateProvider = ServicesContext.Provider;
export const ServicesStateConsumer = ServicesContext.Consumer;

export function useServicesStateContext(
  services: Array<Pick<ServicesServiceState, 'name'>> = [],
  initialState: Partial<ServicesState> = initialServiceState,
): ServicesStateContextValue {
  const backyardState = useBackyardState();
  const [state, dispatch] = useReducer<
    Reducer<ServicesState, ServicesStateActions>
  >(serviceStateReducer, {
    ...initialServiceState,
    ...initialState,
    backyardStateServices: backyardState?.serviceFrames ?? [],
  });

  useEffect(() => {
    if (services) {
      services.forEach((service) => {
        dispatch({
          type: 'add-service',
          payload: service,
        });
      });
    }
  }, []);

  return [state, dispatch];
}
