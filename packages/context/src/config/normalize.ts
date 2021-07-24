import { randomBytes, createHash } from 'crypto';

import deepDefaults from 'lodash.defaultsdeep';

import type { Configuration, FullConfiguration } from '@backyard/types';

import { configurationSchema } from './schema';

export function normalizeConfig(
  config: Configuration,
  initialConfig: Configuration = {},
): FullConfiguration {
  const iat = 384584607;
  const defaults: Configuration = {
    operatorToken: randomBytes(100).toString('hex'),
    jwt: {
      iat,
      groupName: 'backyard',
      exp: iat + 60 * 60 * 24 * 365 * 50,
      secret: createHash('md5').update(randomBytes(64)).digest('hex'),
    },
  };
  const { value } = configurationSchema.validate(
    deepDefaults(config, initialConfig, defaults),
  );

  return value as FullConfiguration;
}
