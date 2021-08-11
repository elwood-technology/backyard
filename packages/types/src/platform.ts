import { Context } from './context';
import { Json, JsonObject } from './scalar';

export interface PlatformPlugin {
  [index: string]: (...args: Json) => Promise<Json>;
}
export type PlatformPlugins = Record<string, PlatformPlugin>;

export interface PlatformHookArgs<
  Plugins extends PlatformPlugins = PlatformPlugins,
> extends JsonObject {
  context: Context;
  plugins: Plugins;
}

export type PlatformHook<Plugins extends PlatformPlugins = PlatformPlugins> = (
  args: PlatformHookArgs<Plugins>,
) => Promise<void>;

export interface PlatformCommandHookArgs<
  Plugins extends PlatformPlugins = PlatformPlugins,
> extends PlatformHookArgs<Plugins> {
  commandOptions: JsonObject;
}

export type PlatformInitArgs = {
  registerPlugin(name: string, module: string): void;
};

export type PlatformLocalHooks =
  | 'before'
  | 'after'
  | 'build'
  | 'start'
  | 'stop'
  | 'clean';

export type PlatformRemoteHooks = 'build' | 'deploy' | 'teardown';

export interface Platform<Options extends JsonObject = JsonObject>
  extends JsonObject {
  init(args: PlatformInitArgs): Promise<void>;
  setOptions(options: Options): void;
  getOptions(): Options;
}

export interface LocalPlatform<
  Plugins extends PlatformPlugins = PlatformPlugins,
> extends Platform {
  before?(args: PlatformHookArgs<Plugins>): Promise<void>;
  after?(args: PlatformHookArgs<Plugins>): Promise<void>;
  build(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  start(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  stop(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  clean(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
}

export interface RemotePlatform<
  Plugins extends PlatformPlugins = PlatformPlugins,
> extends Platform {
  build(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  deploy(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  teardown(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
}
