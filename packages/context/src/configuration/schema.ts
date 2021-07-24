import { randomBytes, createHash } from 'crypto';

import { string, number, object, array, boolean, alternatives } from 'joi';

import {
  Configuration,
  ConfigurationResolve,
  ConfigurationServiceDevServerSettings,
  ConfigurationJwt,
  ConfigurationSite,
  ConfigurationServiceKongSettings,
} from '@backyard/types';

export const configurationProviderSchema = alternatives().try(
  string(),
  array().ordered(string(), object()),
);

export const configurationServiceSchema = object({
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
  secret: string()
    .length(32)
    .default(createHash('md5').update(randomBytes(64)).digest('hex')),
  groupName: string().default('backyard'),
  exp: number().default(3000),
});

export const configurationSchema = object<Configuration>({
  root: string(),
  resolve: configurationResolveSchema.default({}),
  operatorToken: string().min(32).default(randomBytes(100).toString('hex')),
  jwt: configurationJsonWebTokenSchema.default({}),
  services: array().items(configurationServiceSchema).default([]),
  sites: array().items(configurationSiteSchema).default([]),
});

export const configurationKongSettingsSchema =
  object<ConfigurationServiceKongSettings>({
    port: number(),
    containerPort: number(),
    tlsPort: number(),
  });

export const configurationDevServerSettingsSchema =
  object<ConfigurationServiceDevServerSettings>({
    port: number().default(3000),
    watch: boolean().default(false),
    watchPaths: array().items(string()),
  });
