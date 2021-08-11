import {
  Platform,
  ContextPlatform,
  Json,
  JsonObject,
  Context,
  PlatformPlugin,
} from '@backyard/types';
import { isFunction } from '@backyard/common';

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

  async init(): Promise<void> {}
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
      result = await fn({
        options: this.#options,
        context: this.#context,
        ...args,
      });
    }

    return result as Result;
  }
}
