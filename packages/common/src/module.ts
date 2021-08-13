import {
  ConfigurationModule,
  ConfigurationModuleOptions,
} from '@backyard/types';

export function requireModule<T>(
  id: string,
  paths: string[] = [],
): T | undefined {
  const mod = require(require.resolve(id, {
    paths: [...paths, ...(require.main?.paths ?? [])],
  })) as {
    default?: T;
  };

  if (!mod) {
    return undefined;
  }

  if (mod.default) {
    return mod.default;
  }

  return mod as T;
}

export function silentResolve(id: string): string | undefined {
  try {
    return require.resolve(id);
  } catch (_error) {
    return undefined;
  }
}

export function normalizeModuleDef(
  mod: ConfigurationModule,
): [string, ConfigurationModuleOptions] {
  if (typeof mod === 'string') {
    return [mod, {}];
  }

  if (!Array.isArray(mod)) {
    const { resolve, ...options } = mod as ConfigurationModuleOptions;
    return [resolve!, options];
  }

  if (mod.length === 1) {
    return normalizeModuleDef([mod[0], {}]);
  }

  const [first, options = {}] = mod as [
    string | ConfigurationModuleOptions,
    ConfigurationModuleOptions,
  ];

  if (typeof first === 'string') {
    return [first, options];
  }

  if (first.resolve) {
    const { resolve, ...rest } = first;
    return [resolve!, { ...options, ...rest }];
  }

  return mod;
}
