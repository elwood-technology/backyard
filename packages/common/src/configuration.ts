import { Configuration, ConfigurationService } from '@backyard/types';

type ArgFn<T> = (mode: string) => T;
type Arg<T> = T | ArgFn<T>;

function configProvider<T>(config: Arg<T>): T {
  if (typeof config === 'function') {
    return (config as ArgFn<T>)(process.env.BACKYARD_MODE || 'build');
  }

  return config;
}

export function createConfiguration(config: Arg<Configuration>): Configuration {
  return configProvider<Configuration>(config);
}

export function createServiceConfiguration(
  config: Arg<ConfigurationService>,
): ConfigurationService {
  return configProvider<ConfigurationService>(config);
}
