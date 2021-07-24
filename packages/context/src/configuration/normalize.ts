import type { Configuration, FullConfiguration } from '@backyard/types';

import {
  configurationSchema,
  configurationKongSettingsSchema,
  configurationDevServerSettingsSchema,
} from './schema';

export function normalizeConfig(config: Configuration): FullConfiguration {
  const defaults: Configuration = {
    jwt: {},
    services: [],
    sites: [],
  };

  const { value } = configurationSchema.validate({
    ...defaults,
    ...config,
  });

  const v = value as Configuration;

  v.services = v.services?.map((item) => {
    switch (item.name) {
      case 'kong':
        return {
          ...item,
          settings: configurationKongSettingsSchema.validate(item.settings),
        };
      case 'dev-server':
        return {
          ...item,
          settings: configurationDevServerSettingsSchema.validate(
            item.settings,
          ),
        };
      default:
        return item;
    }
  });

  return v as FullConfiguration;
}
