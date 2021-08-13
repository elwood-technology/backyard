import type {
  Platform,
  JsonObject,
  RemotePlatform,
  PlatformCommandHookArgs,
  PlatformInitArgs,
  PlatformPlugins,
} from '@backyard/types';

export abstract class AbstractPlatform<Options extends JsonObject = JsonObject>
  implements Platform<Options>
{
  protected options: Options = {} as Options;

  async init(_args: PlatformInitArgs): Promise<void> {
    return;
  }

  setOptions(options: Options): void {
    this.options = options;
  }

  getOptions(): Options {
    return this.options;
  }
}

export abstract class AbstractRemotePlatform<
    Options extends JsonObject = JsonObject,
    Plugins extends PlatformPlugins = PlatformPlugins,
  >
  extends AbstractPlatform<Options>
  implements RemotePlatform
{
  abstract build(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  abstract deploy(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  abstract clean(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
  abstract teardown(args: PlatformCommandHookArgs<Plugins>): Promise<void>;
}
