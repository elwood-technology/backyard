import { Context } from './context';
import { JsonObject } from './scalar';

export type PlatformHook = (
  context: Context,
  args: JsonObject,
) => Promise<void>;

export interface Platform<Options extends JsonObject = JsonObject>
  extends JsonObject {
  setOptions(options: Options): void;
  getOptions(): Options;
}

export interface LocalPlatform extends Platform {
  before?(context: Context): Promise<void>;
  after?(context: Context): Promise<void>;
  init(context: Context, options?: JsonObject): Promise<void>;
  start(context: Context, options?: JsonObject): Promise<void>;
  stop(context: Context, options?: JsonObject): Promise<void>;
  clean(context: Context, options?: JsonObject): Promise<void>;
}

export interface RemotePlatform extends Platform {
  build(context: Context, options?: JsonObject): Promise<void>;
  deploy(context: Context, options?: JsonObject): Promise<void>;
  teardown(context: Context, options?: JsonObject): Promise<void>;
}
