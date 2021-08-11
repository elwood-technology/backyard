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
  const local = loadPlatform<LocalPlatform>(
    config.platform?.local ?? '@backyard/platform-docker',
    'local',
  );
  const remote = loadPlatform<RemotePlatform>(
    config.platform?.remote,
    'remote',
  );

  invariant(local, 'Unable to load local platform');

  return {
    local: new ContextPlatformState('local', local),
    remote: remote && new ContextPlatformState('remote', remote),
  };
}

export function loadPlatform<P extends Platform = Platform>(
  module: ConfigurationModule | undefined,
  type: 'local' | 'remote',
): P | undefined {
  const [platform, options] = resolvePlatform(module);
  const w = platform[type];

  if (!w) {
    return undefined;
  }

  if (isFunction(w.setOptions)) {
    w.setOptions(options);
  }

  return w as P;
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
