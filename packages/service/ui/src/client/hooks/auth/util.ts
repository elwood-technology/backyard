import { useCallback } from 'react';

import type { JsonObject } from '@backyard/types';

import {
  useBackyardStateApiAnonKey,
  useBackyardStateGatewayBaseUrl,
} from '../backyard-state';
import { AuthSession, AuthState } from './types';

export function getAuthServiceUrl(baseUrl: string): string {
  return `${baseUrl}/auth/v1`;
}

type AuthFetcher<Data = JsonObject> = (
  url: string,
  reqInit?: RequestInit,
) => Promise<Data>;

export function authFetcherProvider<Data extends JsonObject = JsonObject>(
  baseUrl: string,
  init: RequestInit,
): AuthFetcher<Data> {
  return async function fetcher(url: string, reqInit: RequestInit = {}) {
    const res = await fetch(`${baseUrl}${url}`, {
      ...init,
      ...reqInit,
      headers: { ...init.headers, ...reqInit.headers },
    });

    if (res.status >= 300) {
      throw new Error(`Invalid Status: ${res.statusText}`);
    }

    if (res.status === 204) {
      return {} as Data;
    }

    return (await res.json()) as Data;
  };
}

export function useAuthRequest<Data extends JsonObject = JsonObject>(
  init: RequestInit = {},
): AuthFetcher<Data> {
  const baseUrl = getAuthServiceUrl(useBackyardStateGatewayBaseUrl());
  const apiKey = useBackyardStateApiAnonKey();

  const execute = useCallback(
    (url: string, reqInit: RequestInit = {}) => {
      return authFetcherProvider<Data>(baseUrl, {
        ...init,
        headers: {
          ...init.headers,
          apikey: apiKey,
        },
      })(url, reqInit);
    },
    [baseUrl, apiKey],
  );

  return execute;
}

export function normalizeAuthSession(session: AuthSession): AuthSession {
  const timeNow = Math.round(Date.now() / 1000);

  if (session.expires_in) {
    return {
      ...session,
      expires_at: timeNow + session.expires_in,
    };
  }

  return session;
}

export function authHeader(authState: AuthState): JsonObject {
  if (authState.session?.access_token) {
    return {
      authorization: `Bearer ${authState.session.access_token}`,
    };
  }

  return {};
}
