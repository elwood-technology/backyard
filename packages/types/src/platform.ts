import { Context } from './context';
import { JsonObject } from './scalar';

export interface PlatformHookArgs extends JsonObject {
  context: Context;
}

export type PlatformHook = (args: PlatformHookArgs) => Promise<void>;

export interface PlatformCommandHookArgs extends PlatformHookArgs {
  commandOptions: JsonObject;
}

export interface Platform<Options extends JsonObject = JsonObject>
  extends JsonObject {
  setOptions(options: Options): void;
  getOptions(): Options;
}

export interface LocalPlatform extends Platform {
  before?(args: PlatformHookArgs): Promise<void>;
  after?(args: PlatformHookArgs): Promise<void>;
  build(args: PlatformCommandHookArgs): Promise<void>;
  start(args: PlatformCommandHookArgs): Promise<void>;
  stop(args: PlatformCommandHookArgs): Promise<void>;
  clean(args: PlatformCommandHookArgs): Promise<void>;
}

export interface RemotePlatform extends Platform {
  build(args: PlatformCommandHookArgs): Promise<void>;
  deploy(args: PlatformCommandHookArgs): Promise<void>;
  teardown(args: PlatformCommandHookArgs): Promise<void>;
}
