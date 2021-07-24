import template from 'lodash.template';

import type {
  ConfigurationService,
  ContextService,
  Context,
  ServiceHooks,
  ConfigurationServiceGateway,
  ConfigurationServiceContainer,
  JsonObject,
  Json,
} from '@backyard/types';

import { invariant, isFunction } from '@backyard/common';

import { loadService } from './load';
import { resolveServiceConfig } from './config';

export class Service implements ContextService {
  readonly #initialConfig: ConfigurationService;

  #hasInitialized = false;

  #resolvedConfig: ConfigurationService | undefined;
  #moduleRootPath: string | undefined;
  #apiModulePath: string | undefined;
  #uiModulePath: string | undefined;
  #hooks: ServiceHooks = {};
  #platformHooks: ServiceHooks = {};
  #context: Context | undefined;
  #type: string | undefined;

  constructor(initialConfig: ConfigurationService) {
    this.#initialConfig = initialConfig;
  }

  async load(): Promise<void> {
    const {
      hooks,
      moduleRootPath,
      apiModulePath,
      uiModulePath,
      type,
      platformHooks,
    } = await loadService(this.#initialConfig);

    this.#moduleRootPath = moduleRootPath;
    this.#apiModulePath = apiModulePath;
    this.#uiModulePath = uiModulePath;
    this.#type = type;
    this.#hooks = hooks;
    this.#platformHooks = platformHooks;
  }

  setContext(context: Context): void {
    this.#context = context;
  }

  getContext(): Context {
    invariant(this.#context, 'No context set');
    return this.#context;
  }

  getHooks(): ServiceHooks {
    return this.#hooks;
  }

  getPlatformHooks(): ServiceHooks {
    return this.#platformHooks;
  }

  setPlatformHooks(hooks: ServiceHooks): void {
    this.#platformHooks = hooks;
  }

  async init(): Promise<void> {
    if (this.#hasInitialized) {
      return;
    }

    this.#hasInitialized = true;

    if (isFunction(this.#hooks.init)) {
      await this.#hooks.init(this.getContext(), this);
    }

    this.#resolvedConfig = await resolveServiceConfig(
      this.getContext(),
      this,
      this.#initialConfig,
    );
  }

  private replaceConfig = (obj: JsonObject, key: string): JsonObject => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      return {
        ...obj,
        [key]: Object.keys(obj[key]).reduce(this.replaceConfig, obj[key]),
      };
    }

    if (typeof obj[key] === 'string') {
      const tpl = template(obj[key]);

      return {
        ...obj,
        [key]: tpl({
          context: this.getContext(),
        }),
      };
    }

    return obj;
  };

  async finalize(): Promise<void> {
    this.#resolvedConfig = Object.keys(this.#resolvedConfig || {}).reduce(
      this.replaceConfig,
      this.#resolvedConfig || {},
    ) as ConfigurationService;
  }

  get name(): string {
    return this.#initialConfig.name;
  }

  get moduleRootPath(): string {
    invariant(
      this.#moduleRootPath,
      `Service "${this.name}" does not have a moduleRootPath`,
    );
    return this.#moduleRootPath;
  }

  get apiModulePath(): string | undefined {
    return this.#apiModulePath;
  }

  get uiModulePath(): string | undefined {
    return this.#uiModulePath;
  }

  get config(): ConfigurationService {
    invariant(this.#resolvedConfig);
    return this.#resolvedConfig;
  }

  get gateway(): ConfigurationServiceGateway | undefined {
    return this.#resolvedConfig?.gateway;
  }

  get container(): ConfigurationServiceContainer | undefined {
    return this.#resolvedConfig?.container;
  }

  get type(): string {
    return this.#type ?? 'local';
  }

  async stage(dir: string): Promise<void> {
    if (isFunction(this.#platformHooks.stage)) {
      this.#platformHooks.stage(dir, this.getContext(), this);
    }

    if (isFunction(this.#hooks.stage)) {
      this.#hooks.stage(dir, this.getContext(), this);
    }
  }

  async hook(name: string, args: JsonObject): Promise<Json> {
    let result: Json = undefined;

    if (
      this.#platformHooks.hooks &&
      isFunction(this.#platformHooks.hooks[name])
    ) {
      result = await this.#platformHooks.hooks[name]({
        context: this.getContext(),
        service: this,
        ...args,
      });
    }

    if (this.#hooks.hooks && isFunction(this.#hooks.hooks[name])) {
      result = await this.#hooks.hooks[name]({
        context: this.getContext(),
        service: this,
        parent: result,
        ...args,
      });
    }

    return result;
  }
}
