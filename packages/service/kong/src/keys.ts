import jwt from 'jsonwebtoken';

import type { ConfigurationService } from '@backyard/types';
import { KongKeys, KongServiceSettings } from './types';
import { invariant } from '@backyard/common';

export function generateKeys(
  config: ConfigurationService<KongServiceSettings>,
): KongKeys {
  const { settings } = config;
  const secret = settings?.jwt.secret;

  invariant(secret, 'No jwt.secret provided to Kong');
  invariant(settings?.jwt?.iat, 'No jwt.iat provided to Kong');

  const iat = Number(settings?.jwt?.iat);
  const exp = Number(settings?.jwt?.exp);

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
