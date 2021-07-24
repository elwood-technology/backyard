import { useContext } from 'react';

import { AuthzContext } from './context';
import { AuthzState } from './types';

export function useAuthzState(): AuthzState {
  const [state] = useContext(AuthzContext);
  return state;
}

export function useAuthzStateServices(): AuthzState['services'] {
  return useAuthzState().services || [];
}

export function useAuthzStateServicesWithInterface(): AuthzState['services'] {
  return useAuthzStateServices().filter((item) => item.ui === true);
}
