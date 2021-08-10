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

  const iat = Number(settings?.jwt?.iat ?? new Date().getTime() / 1000);
  const exp = Number(settings?.jwt?.exp ?? iat + 60 * 60 * 24 * 365 * 50);

  const anonymousKey = jwt.sign(
    {
      iss: 'backyard',
      iat,
      exp,
      aud: '',
      sub: '',
      role: 'anon',
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
      role: 'service_role',
    },
    secret,
  );

  return {
    anonymousKey,
    serviceKey,
  };
}
