import { useState } from 'react';

import type { HookState } from '../../types';

import type { AuthUser, AuthSession } from './types';
import { useAuthRequest } from './util';

export interface AuthAdminCreateUserArgs {
  email: string;
  password: string;
  opToken: string;
}

export interface AuthAdminCreateUserState extends HookState<AuthSession> {
  createUser(args: AuthAdminCreateUserArgs): Promise<AuthUser | undefined>;
}

export function useAuthAdminCreateUser(): AuthAdminCreateUserState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const post = useAuthRequest<AuthUser>({
    method: 'POST',
  });

  const execute = async (args: AuthAdminCreateUserArgs) => {
    const { email, password, opToken } = args;
    setLoading(true);

    try {
      return await post(`/admin/users`, {
        headers: {
          authorization: `Bearer ${opToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: 'admin', confirm: true }),
      });
    } catch (err) {
      console.log(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUser: execute,
  };
}
