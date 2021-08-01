import jwt from 'jsonwebtoken';

import type { ConfigurationService } from '@backyard/types';
import { KongKeys, KongSettings } from './types';
import { invariant } from '@backyard/common';

export function generateKeys(
  config: ConfigurationService<KongSettings>,
): KongKeys {
  const { settings } = config;
  const secret = settings?.jwt.secret;

  invariant(secret, 'No secret provided to Kong');

  const iat = settings?.jwt?.iat ?? new Date().getTime() / 1000;
  const exp = settings?.jwt?.exp ?? iat + 60 * 60 * 24 * 365 * 50;

  const anonymousKey = jwt.sign(
    {
      iss: 'backyard',
      iat,
      exp,
      aud: '',
      sub: '',
      Role: 'anon',
    },
    secret,
  );
  const serviceKey = jwt.sign(
    {
      iss: 'backyard',
      iat,
      exp,
      aud: '',
      sub: '',
      Role: 'service_role',
    },
    secret,
  );

  return {
    anonymousKey,
    serviceKey,
  };
}
