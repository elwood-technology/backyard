import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import type { AuthSession, AuthState } from './types';
import { useAuthRequest } from './util';

export type AuthContextValue = [AuthState, Dispatch<SetStateAction<AuthState>>];

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const AuthContextProvider = AuthContext.Provider;
export const AuthContextConsumer = AuthContext.Consumer;

export function useAuthContext(initialState: AuthState): AuthContextValue {
  const storage = localStorage;
  const storageKey = 'backyard.auth';

  const post = useAuthRequest<AuthSession>({
    method: 'POST',
  });

  const [value, setValue] = useState<AuthState>({
    ...initialState,
    status: 'none',
  });

  function mergeValue(nextValue: Partial<AuthState>): AuthState {
    return {
      ...value,
      ...nextValue,
    };
  }

  useEffect(() => {
    if (value.session) {
      storage.setItem(storageKey, JSON.stringify(value.session));
    } else if (value.status === 'logged-out') {
      storage.removeItem(storageKey);
    }
  }, [value.session]);

  useEffect(() => {
    const storedValue = storage.getItem(storageKey);

    if (!storedValue) {
      setValue(
        mergeValue({
          status: 'logged-out',
        }),
      );
      return;
    }

    try {
      if (storedValue) {
        const currentSession = JSON.parse(storedValue);
        const timeNow = Math.round(Date.now() / 1000);

        if (typeof currentSession !== 'object') {
          throw new Error('not an object');
        }

        if (
          currentSession.expires_at >= timeNow &&
          currentSession?.user &&
          currentSession?.refresh_token
        ) {
          setValue(
            mergeValue({
              status: 'recovering',
            }),
          );

          post('/token?grant_type=refresh_token', {
            body: JSON.stringify({
              refresh_token: currentSession.refresh_token,
            }),
          })
            .then((nextSession) => {
              setValue(
                mergeValue({
                  status: 'logged-in',
                  session: nextSession,
                  user: nextSession.user ?? undefined,
                }),
              );
            })
            .catch((err) => {
              console.log(err);
              setValue(
                mergeValue({
                  status: 'logged-out',
                }),
              );
            });
          return;
        }

        setValue(
          mergeValue({
            status: 'logged-in',
            session: currentSession,
            user: currentSession.user ?? undefined,
          }),
        );
      }
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  return [value, setValue];
}
