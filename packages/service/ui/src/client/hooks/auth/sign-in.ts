import { useState } from 'react';

import type { HookState } from '../../types';

import type { AuthUserCredentials, AuthSession } from './types';
import { useAuthStateContext } from './state';
import { useAuthRequest, normalizeAuthSession } from './util';

export interface AuthSignInState extends HookState<AuthSession> {
  signIn(credentials: AuthUserCredentials): Promise<void>;
}

export function useAuthSignIn(): AuthSignInState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [authState, setAuthState] = useAuthStateContext();
  const post = useAuthRequest<AuthSession>({ method: 'POST' });

  const execute = async (credentials: AuthUserCredentials) => {
    setLoading(true);

    try {
      const data = await post(`/token?grant_type=password`, {
        body: JSON.stringify(credentials),
      });

      setLoading(false);
      setAuthState({
        ...authState,
        status: 'logged-in',
        session: normalizeAuthSession(data),
        user: data.user ?? undefined,
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(err);
    }
  };

  return {
    loading,
    error,
    signIn: execute,
  };
}
