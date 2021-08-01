import deepDefaults from 'lodash.defaultsdeep';

import type { Configuration, FullConfiguration } from '@backyard/types';

import { configurationSchema } from './schema';

export function normalizeConfig(
  config: Configuration,
  initialConfig: Configuration = {},
): FullConfiguration {
  const { value } = configurationSchema.validate(
    deepDefaults(config, initialConfig),
  );

  return value as FullConfiguration;
}
