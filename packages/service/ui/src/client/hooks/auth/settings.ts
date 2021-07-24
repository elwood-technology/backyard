import { useEffect, useState } from 'react';
import type { HookState } from '../../types';

import { useAuthRequest } from './util';

export type AuthSettings = {
  external: Record<string, boolean>;
  disable_signup: boolean;
  autoconfirm: boolean;
};

export function useAuthSettings(): HookState<AuthSettings> {
  const [data, setData] = useState<AuthSettings | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const get = useAuthRequest<AuthSettings>({
    method: 'GET',
  });

  useEffect(() => {
    get(`/settings`).then(setData).catch(setError);
  }, []);

  return {
    loading: !data && !error,
    error,
    data,
  };
}
