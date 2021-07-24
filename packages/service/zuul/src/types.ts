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
