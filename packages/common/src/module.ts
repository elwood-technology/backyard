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
