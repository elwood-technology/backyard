import type { JsonObject } from '@backyard/types';

export type AuthUser = {
  id: string;
  app_metadata: JsonObject & {
    provider?: string;
  };
  user_metadata: JsonObject;
  aud: string;
  confirmation_sent_at?: string;
  email?: string;
  created_at: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
};

export type AuthSession = {
  provider_token?: string | null;
  access_token: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
  token_type: string;
  user: AuthUser | null;
};

export type AuthState = {
  status: 'none' | 'recovering' | 'logged-out' | 'logged-in';
  session?: AuthSession;
  user?: AuthUser;
};

export interface AuthUserCredentials {
  email?: string;
  password?: string;
  refreshToken?: string;
  provider?:
    | 'azure'
    | 'bitbucket'
    | 'facebook'
    | 'github'
    | 'gitlab'
    | 'google'
    | 'twitter'
    | 'apple'
    | 'discord'
    | 'twitch';
}
