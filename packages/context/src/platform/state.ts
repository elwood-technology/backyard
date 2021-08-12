import {
  Platform,
  ContextPlatform,
  Json,
  JsonObject,
  Context,
  PlatformPlugin,
} from '@backyard/types';
import {
  invariant,
  isFunction,
  silentResolve,
  requireModule,
} from '@backyard/common';

export class ContextPlatformState<Hooks extends string>
  implements ContextPlatform<Hooks>
{
  #platform: Platform;
  #plugins: Record<string, PlatformPlugin> = {};
  #context: Context | undefined;
  #options: JsonObject = {};

  constructor(public readonly type: 'local' | 'remote', platform: Platform) {
    this.#platform = platform;
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
    if (isFunction(this.#platform.setOptions)) {
      this.#platform.setOptions(options);
    }
  }

  async executeHook<Result = Json>(
    name: Hooks,
    args: JsonObject,
  ): Promise<Result> {
    let result = {} as Result;
    const fn = (this.#platform as unknown as Record<Hooks, any>)[name];

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
