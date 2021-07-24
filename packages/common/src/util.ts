import type { Json } from '@backyard/types';

export function isFunction(func: any): func is Function {
  return typeof func === 'function';
}

export function isEmptyObject(obj: Json): boolean {
  if (!obj || typeof obj !== 'object') {
    return true;
  }

  return Object.keys(obj).length === 0;
}
