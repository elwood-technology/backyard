import joi from 'joi';

import { Configuration, ConfigurationResolve } from '@backyard/types';

export const configurationProviderSchema = joi
  .alternatives()
  .try(joi.string(), joi.array().ordered(joi.string(), joi.object()));

export const configurationServiceSchema = joi.object({
  mode: joi.string(),
  name: joi.string().required(),
  provider: configurationProviderSchema,
  version: joi.number().default(1).min(0).max(Infinity),
  comment: joi.string(),
  settings: joi.object(),
});

export const configurationResolveSchema = joi.object<ConfigurationResolve>({
  backyard: joi.string(),
  source: joi.string(),
  modules: joi.array().items(joi.string()),
});

export const configurationSchema = joi.object<Configuration>({
  root: joi.string(),
  resolve: configurationResolveSchema.default({}),
  services: joi.array().items(configurationServiceSchema).default([]),
});
