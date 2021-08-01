import { string, number, object, array, alternatives } from 'joi';

import {
  Configuration,
  ConfigurationResolve,
  ConfigurationSite,
} from '@backyard/types';

export const configurationProviderSchema = alternatives().try(
  string(),
  array().ordered(string(), object()),
);

export const configurationServiceSchema = object({
  mode: string(),
  name: string().required(),
  provider: configurationProviderSchema,
  version: number().default(1).min(0).max(Infinity),
  comment: string(),
  settings: object(),
});

export const configurationSiteSchema = object<ConfigurationSite>({});
export const configurationResolveSchema = object<ConfigurationResolve>({
  backyard: string(),
  source: string(),
  modules: array().items(string()),
});

export const configurationSchema = object<Configuration>({
  root: string(),
  resolve: configurationResolveSchema.default({}),
  services: array().items(configurationServiceSchema).default([]),
  sites: array().items(configurationSiteSchema).default([]),
});
