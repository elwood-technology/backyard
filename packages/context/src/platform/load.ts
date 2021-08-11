import {
  ConfigurationModule,
  Platform,
  JsonObject,
  RemotePlatform,
  LocalPlatform,
  Context,
  Configuration,
} from '@backyard/types';
import {
  normalizeModuleDef,
  isFunction,
  requireModule,
  invariant,
  AbstractPlatform,
} from '@backyard/common';

import { ContextPlatformState } from './state';

export function loadPlatforms(config: Configuration): Context['platforms'] {
  const { local } = loadPlatform<LocalPlatform>(
    config.platform?.local ?? '@backyard/platform-docker',
  );
  const { remote } = loadPlatform<RemotePlatform>(config.platform?.remote);

  invariant(local, 'Unable to load local platform');

  return {
    local: new ContextPlatformState('local', local),
    remote: remote && new ContextPlatformState('remote', remote),
  };
}

export function loadPlatform<P extends Platform = Platform>(
  module: ConfigurationModule | undefined,
): P {
  const [platform, options] = resolvePlatform(module);

  if (isFunction(platform.setOptions)) {
    platform.setOptions(options);
  }

  return platform as P;
}

export function resolvePlatform(
  config: ConfigurationModule | undefined,
): [Platform, JsonObject] {
  if (!config) {
    return [new (class extends AbstractPlatform {})(), {}];
  }

  const [modulePath, options] = normalizeModuleDef(config);
  const hooks = requireModule(modulePath) as Platform;
  return [hooks, options];
}
