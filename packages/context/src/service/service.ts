import { compile as template } from 'ejs';

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

import { invariant, debug, isFunction } from '@backyard/common';

import { loadService } from './load';
import { resolveServiceConfig } from './config';

const log = debug('backyard:context:service');

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
    log(`${this.name}.load()`);
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
    log(`${this.name}.init()`);

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

  private async replaceConfig(obj: Json): Promise<Json> {
    if (typeof obj === 'string') {
      const tpl = template(obj, { async: true });

      return await tpl({
        context: this.getContext(),
      });
    }

    if (Array.isArray(obj) || typeof obj === 'object') {
      for (const item in obj) {
        obj[item] = await this.replaceConfig(obj[item]);
      }
    }

    return obj;
  }

  async finalize(): Promise<void> {
    log(`${this.name}.finalize()`);

    try {
      this.#resolvedConfig = await this.replaceConfig(
        this.#resolvedConfig || {},
      );
    } catch (err) {
      throw new Error(
        `Unable to finalize configuration for "${this.name}. Error: ${err.message}"`,
      );
    }

    const depend = this.#resolvedConfig?.dependencies ?? [];

    for (const dependServiceName of depend) {
      try {
        this.getContext().getService(dependServiceName);
      } catch (err) {
        throw new Error(`
          Service "${this.name}" depends on "${dependServiceName}" which is not loaded.
        `);
      }
    }
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

  getResolvedConfig(): ConfigurationService | undefined {
    return this.#resolvedConfig;
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
    log(`${this.name}.stage()`);

    if (isFunction(this.#platformHooks.stage)) {
      this.#platformHooks.stage(dir, this.getContext(), this);
    }

    if (isFunction(this.#hooks.stage)) {
      this.#hooks.stage(dir, this.getContext(), this);
    }
  }

  hook = async <R = Json>(name: string, args: JsonObject): Promise<R> => {
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

    return result as R;
  };

  getGatewayUrl(): string {
    const gateway = this.getContext().services.get('gateway');
    return `http://${gateway?.container?.host}:${gateway?.container?.port}/${this.name}/v1`;
  }

  getContainerUrl(): string {
    const gateway = this.getContext().services.get('gateway');
    const host = gateway?.container?.externalHost ?? '0.0.0.0';

    if (this.name === 'gateway') {
      return `http://${host}:${gateway?.container?.externalPort}`;
    }

    return `http://${host}:${gateway?.container?.externalPort}/${this.name}/v1`;
  }
}
