import deepDefaults from 'deepmerge';

import type { Configuration, FullConfiguration } from '@backyard/types';

import { configurationSchema } from './schema';

export function normalizeConfig(
  config: Configuration,
  initialConfig: Configuration = {},
): FullConfiguration {
  const { value } = configurationSchema.validate(
    deepDefaults(initialConfig, config),
  );

  return value as FullConfiguration;
}
