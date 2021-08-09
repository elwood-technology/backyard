import {
  ConfigurationModule,
  Platform,
  ContextPlatform,
  Json,
  JsonObject,
  RemotePlatform,
  LocalPlatform,
  PlatformCommandHookArgs,
  Context,
  Configuration,
  PlatformHookArgs,
} from '@backyard/types';
import {
  normalizeModuleDef,
  isFunction,
  requireModule,
  invariant,
  AbstractPlatform,
} from '@backyard/common';

export function loadPlatforms(config: Configuration): Context['platforms'] {
  const { local } = loadPlatform<LocalPlatform>(
    config.platform?.local ?? '@backyard/platform-docker',
  );
  const { remote } = loadPlatform<RemotePlatform>(config.platform?.remote);

  invariant(local, 'Unable to load local platform');

  return {
    local: new ContextPlatformStateLocal('local', local),
    remote: remote && new ContextPlatformStateRemote('remote', remote),
  };
}

export function loadPlatform<P extends Platform = Platform>(
  module: ConfigurationModule | undefined,
): P {
  const [platform, options] = resolvePlatform(module);

  if (isFunction(platform.setOptions)) {
    platform.setOptions(options);
  }

  return platform as P;
}

export function resolvePlatform(
  config: ConfigurationModule | undefined,
): [Platform, JsonObject] {
  if (!config) {
    return [new (class extends AbstractPlatform {})(), {}];
  }

  const [modulePath, options] = normalizeModuleDef(config);
  const hooks = requireModule(modulePath) as Platform;
  return [hooks, options];
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
    name: string,
    args: PlatformHookArgs,
  ): Promise<Result> {
    let result = {} as Result;
    const fn = this.#platform[name];

    if (fn && isFunction(fn)) {
      result = await fn({ options: this.getOptions(), ...args });
    }

    return result as Result;
  }

  hook = async <Result = Json>(
    context: Context,
    name: string,
    args: JsonObject,
  ): Promise<Result> => {
    return await this.executeHook(name, { context, ...args });
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
  async before(args: PlatformHookArgs): Promise<void> {
    await this.executeHook('before', args);
  }
  async after(args: PlatformHookArgs): Promise<void> {
    await this.executeHook('after', args);
  }
  async build(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('build', args);
  }
  async start(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('start', args);
  }
  async stop(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('stop', args);
  }
  async clean(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('clean', args);
  }
}

export class ContextPlatformStateRemote
  extends ContextPlatformState
  implements RemotePlatform
{
  async build(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('build', args);
  }
  async deploy(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('deploy', args);
  }
  async teardown(args: PlatformCommandHookArgs): Promise<void> {
    await this.executeHook('teardown', args);
  }
}
