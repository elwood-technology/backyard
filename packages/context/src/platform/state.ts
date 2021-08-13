import {
  Platform,
  ContextPlatform,
  Json,
  JsonObject,
  Context,
  PlatformPlugin,
  ContextPlatformTypeName,
  ConfigurationService,
} from '@backyard/types';
import {
  invariant,
  isFunction,
  silentResolve,
  requireModule,
} from '@backyard/common';

export class ContextPlatformState<
  T extends ContextPlatformTypeName,
  Hooks extends string,
> implements ContextPlatform<T, Hooks>
{
  #platform: Platform;
  #plugins: Record<string, PlatformPlugin> = {};
  #context: Context | undefined;
  #options: JsonObject = {};

  constructor(
    public readonly type: T,
    platform: Platform,
    options: JsonObject,
  ) {
    this.#platform = platform;
    this.setOptions(options);
  }

  get platform() {
    return this.#platform;
  }

  get plugins() {
    return this.#plugins;
  }

  setContext(context: Context): void {
    this.#context = context;
  }

  async config(
    context: Context,
    config: ConfigurationService,
  ): Promise<ConfigurationService> {
    if (isFunction(this.#platform.config)) {
      return this.#platform.config(context, config);
    }
    return config;
  }

  async init(): Promise<void> {
    if (isFunction(this.#platform.init)) {
      await this.#platform.init({
        registerPlugin: (name: string, provider: string) => {
          const p = silentResolve(provider);

          invariant(
            p,
            `Unable to resolve requested plugin "${provider}" as "${name}"`,
          );

          this.#plugins[name] = requireModule(p) as PlatformPlugin;
        },
      });
    }
  }

  setOptions(options: JsonObject): void {
    this.#options = options;

    if (isFunction(this.#platform.setOptions)) {
      this.#platform.setOptions(options);
    }
  }

  getOptions(): JsonObject {
    return this.#options;
  }

  async executeHook<Result = Json>(
    name: Hooks,
    args: JsonObject,
  ): Promise<Result> {
    let result = {} as Result;
    const fn = (this.#platform as unknown as Record<Hooks, any>)[name];

    // console.log(name, this.#options);

    if (fn && isFunction(fn)) {
      result = await fn.call(this.#platform, {
        options: this.#options,
        context: this.#context,
        plugins: this.#plugins,
        ...args,
      });
    }

    return result as Result;
  }
}
