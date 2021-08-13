import {
  ConfigurationModule,
  Platform,
  JsonObject,
  RemotePlatform,
  LocalPlatform,
  Context,
  Configuration,
  ContextPlatformTypeName,
  PlatformLocalHooks,
  PlatformRemoteHooks,
  ContextPlatformLocal,
  ContextPlatformRemote,
  ContextPlatform,
} from '@backyard/types';
import {
  normalizeModuleDef,
  requireModule,
  invariant,
  AbstractPlatform,
} from '@backyard/common';

import { ContextPlatformState } from './state';

export function loadPlatforms(config: Configuration): Context['platforms'] {
  const local = loadPlatform(
    config.platform?.local ?? '@backyard/platform-docker',
    'local',
  ) as ContextPlatformLocal;
  const remote = loadPlatform(
    config.platform?.remote,
    'remote',
  ) as ContextPlatformRemote;

  invariant(local, 'Unable to load local platform');

  return {
    local,
    remote,
  };
}

export function loadPlatform(
  module: ConfigurationModule | undefined,
  type: ContextPlatformTypeName,
): ContextPlatform<ContextPlatformTypeName, string> | undefined {
  const [platform, options] = resolvePlatform(module);
  const w = platform[type];

  if (!w) {
    return undefined;
  }

  if (type === 'local') {
    return new ContextPlatformState<'local', PlatformLocalHooks>(
      'local',
      w as LocalPlatform,
      options,
    );
  }

  return new ContextPlatformState<'remote', PlatformRemoteHooks>(
    'remote',
    w as RemotePlatform,
    options,
  );
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
