import { useContext } from 'react';

import { invariant } from 'ts-invariant';

import { AuthContext, AuthContextValue } from './context';
import { AuthSession, AuthState, AuthUser } from './types';

export const initialAuthState: AuthState = {
  status: 'none',
};

export function useAuthState(): AuthState {
  const [state] = useContext(AuthContext) ?? [];
  return state ?? initialAuthState;
}

export function useAuthStateContext(): AuthContextValue {
  const value = useContext(AuthContext);
  invariant(value, 'No AuthContext set');
  return value;
}

export function useAuthCurrentUser(): AuthUser | undefined {
  return useAuthState().user;
}

export function useAuthCurrentSession(): AuthSession | undefined {
  return useAuthState().session;
}
