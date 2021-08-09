import {
  ConfigurationModule,
  Platform,
  ContextPlatform,
  Json,
  JsonObject,
  RemotePlatform,
  LocalPlatform,
} from '@backyard/types';
import { normalizeModuleDef, isFunction } from '@backyard/common';

import { loadServicesModuleHooksFromFile } from './service/hooks';
import { Context } from 'vm';

export function resolvePlatform<P extends Platform = Platform>(
  config: ConfigurationModule | undefined,
): P {
  if (!config) {
    return {} as P;
  }

  const [mod, options] = normalizeModuleDef(config);
  const hooks = loadServicesModuleHooksFromFile(mod) as Platform;

  if (isFunction(hooks.setOptions)) {
    hooks.setOptions(options);
  }

  return hooks as P;
}

export class ContextPlatformState implements ContextPlatform {
  #platform: Platform;

  constructor(public readonly type: 'local' | 'remote', platform: Platform) {
    this.#platform = platform;
  }

  get platform() {
    return this.#platform;
  }

  async executeHook<Result = Json>(
    context: Context,
    name: string,
    args: JsonObject = {},
  ): Promise<Result> {
    let result = {} as Result;
    const fn = this.#platform[name];

    if (fn && isFunction(fn)) {
      result = await fn({ context, ...args });
    }

    return result as Result;
  }

  hook = async <Result = Json>(
    context: Context,
    name: string,
    args: JsonObject,
  ): Promise<Result> => {
    return await this.executeHook(context, name, args);
  };

  setOptions(options: JsonObject): void {
    if (isFunction(this.#platform.setOptions)) {
      this.#platform.setOptions(options);
    }
  }
  getOptions(): JsonObject {
    if (isFunction(this.#platform.getOptions)) {
      return this.#platform.getOptions();
    }

    return {};
  }
}

export class ContextPlatformStateLocal
  extends ContextPlatformState
  implements LocalPlatform
{
  async before(context: Context): Promise<void> {
    await this.executeHook(context, 'before');
  }
  async after(context: Context): Promise<void> {
    await this.executeHook(context, 'after');
  }
  async init(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'init', options);
  }
  async start(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'start', options);
  }
  async stop(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'stop', options);
  }
  async clean(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'clean', options);
  }
}

export class ContextPlatformStateRemote
  extends ContextPlatformState
  implements RemotePlatform
{
  async build(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'build', options);
  }
  async deploy(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'deploy', options);
  }
  async teardown(context: Context, options?: JsonObject): Promise<void> {
    await this.executeHook(context, 'teardown', options);
  }
}
