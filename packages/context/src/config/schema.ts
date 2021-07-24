import { string, number, object, array, alternatives } from 'joi';

import {
  Configuration,
  ConfigurationResolve,
  ConfigurationJwt,
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

export const configurationJsonWebTokenSchema = object<ConfigurationJwt>({
  secret: string().length(32),
  groupName: string(),
  exp: number(),
  iat: number(),
});

export const configurationSchema = object<Configuration>({
  root: string(),
  resolve: configurationResolveSchema.default({}),
  operatorToken: string().min(32),
  jwt: configurationJsonWebTokenSchema.default({}),
  services: array().items(configurationServiceSchema).default([]),
  sites: array().items(configurationSiteSchema).default([]),
});
