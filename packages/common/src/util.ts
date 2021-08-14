import type { Json } from '@backyard/types';
import { invariant } from './depend';

export function isFunction(func: any): func is Function {
  return typeof func === 'function';
}

export function isEmptyObject(obj: Json): boolean {
  if (!obj || typeof obj !== 'object') {
    return true;
  }

  return Object.keys(obj).length === 0;
}

export function useEnvValue(name: string, description?: string): string {
  invariant(
    process.env[name],
    description ?? `${name} environment variable is not set`,
  );
  return String(process.env[name]);
}
