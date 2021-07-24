import { Context } from './context';
import { JsonObject } from './scalar';

export type PlatformHook = (
  context: Context,
  args: JsonObject,
) => Promise<void>;

export interface LocalPlatform
  extends Record<string, PlatformHook | undefined> {
  before?(context: Context): Promise<void>;
  after?(context: Context): Promise<void>;
  init(context: Context, options?: JsonObject): Promise<void>;
  start(context: Context, options?: JsonObject): Promise<void>;
  stop(context: Context, options?: JsonObject): Promise<void>;
  clean(context: Context, options?: JsonObject): Promise<void>;
}

export interface RemotePlatform extends Record<string, PlatformHook> {
  build(context: Context, options?: JsonObject): Promise<void>;
  deploy(context: Context, options?: JsonObject): Promise<void>;
  teardown(context: Context, options?: JsonObject): Promise<void>;
}
