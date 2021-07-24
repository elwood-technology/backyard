import { useState } from 'react';

import type { HookState } from '../../types';

import type { AuthSession } from './types';
import { useAuthStateContext } from './state';
import { useAuthRequest, authHeader } from './util';

export interface AuthSignOutState extends HookState<unknown> {
  signOut(): Promise<void>;
}

export function useAuthSignOut(): AuthSignOutState {
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useAuthStateContext();
  const post = useAuthRequest<AuthSession>({
    method: 'POST',
    headers: {
      ...authHeader(authState),
    },
  });

  const execute = async () => {
    setLoading(true);

    try {
      await post(`/logout`, {});
    } catch (err) {
      // ignore any errors
    }

    setLoading(false);
    setAuthState({
      status: 'logged-out',
    });
  };

  return {
    loading,
    signOut: execute,
  };
}
