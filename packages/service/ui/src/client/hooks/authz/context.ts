import {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';

import { useAuthState, useAuthSignOut } from '../auth';
import {
  useBackyardStateApiAnonKey,
  useBackyardStateGatewayBaseUrl,
} from '../backyard-state';
import type { AuthzState } from './types';

export type AuthzContextValue = [
  AuthzState,
  Dispatch<SetStateAction<AuthzState>>,
];

export const initialAuthzState: AuthzState = {
  services: [],
  fetching: false,
};

export const AuthzContext = createContext<AuthzContextValue>([
  initialAuthzState,
  () => {},
]);

export const AuthzContextProvider = AuthzContext.Provider;
export const AuthzContextConsumer = AuthzContext.Consumer;

class UnauthorizedError extends Error {}

export function useAuthzContext(
  initialState: Partial<AuthzState> = {},
): AuthzContextValue {
  const { signOut } = useAuthSignOut();
  const apiKey = useBackyardStateApiAnonKey();
  const baseUrl = useBackyardStateGatewayBaseUrl();
  const authState = useAuthState();
  const [value, setValue] = useState<AuthzState>({
    ...initialAuthzState,
    ...initialState,
  });

  async function fetchServices(): Promise<AuthzState['services']> {
    const response = await fetch(`${baseUrl}/authz/v1/services`, {
      headers: {
        apikey: apiKey,
        authorization: `Bearer ${authState.session?.access_token}`,
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedError('Unauthorized');
    }

    if (response.status !== 200) {
      throw new Error(
        `Unable to fetch services (${response.status}: ${response.statusText})`,
      );
    }

    return (await response.json()).services;
  }

  useEffect(() => {
    if (!authState.session?.access_token) {
      return;
    }

    setValue({
      ...value,
      fetching: true,
    });
    fetchServices()
      .then((services) => {
        setValue({
          ...value,
          services,
          fetching: false,
        });
      })
      .catch((err) => {
        setValue({
          ...value,
          error: err,
          fetching: false,
        });

        if (err instanceof UnauthorizedError) {
          return signOut();
        }
      });
  }, [authState.session?.access_token]);

  return [value, setValue];
}
