import type {
  DeepRequired,
  ConfigurationService,
  ContextService,
  Context,
  ServiceHooks,
  ConfigurationServiceGateway,
  ConfigurationServiceContainer,
  JsonObject,
  Json,
  ContextPlatform,
  ContextPlatformTypeName,
} from '@backyard/types';

import { invariant, debug } from '@backyard/common';

import { replaceConfigTemplateVariables } from './config';
import { executeServiceHook } from './hooks';

const log = debug('backyard:context:service');

export type ContextServiceStateInput = Pick<
  ContextService,
  'type' | 'moduleRootPath' | 'apiModulePath' | 'uiModulePath'
> & {
  config: DeepRequired<ConfigurationService>;
  hooks: ServiceHooks;
  platform?: ContextPlatform<ContextPlatformTypeName, string>;
  providerExtendHooks: ServiceHooks;
};

export class ContextServiceState implements ContextService {
  readonly #state: ContextServiceStateInput;
  readonly #context: Context;

  #config: DeepRequired<ConfigurationService>;
  #hasInitialized = false;

  constructor(context: Context, state: ContextServiceStateInput) {
    this.#context = context;
    this.#config = state.config;
    this.#state = state;
  }

  get name(): string {
    return this.#state.config.name;
  }

  get provider(): string {
    return this.#state.config.provider[0];
  }

  get moduleRootPath(): string {
    return this.#state.moduleRootPath;
  }

  get apiModulePath(): string | undefined {
    return this.#state.apiModulePath;
  }

  get uiModulePath(): string | undefined {
    return this.#state.uiModulePath;
  }

  get config(): ConfigurationService {
    return this.#config;
  }

  get gateway(): ConfigurationServiceGateway {
    return this.#config.gateway;
  }

  get container(): ConfigurationServiceContainer {
    return this.#config.container;
  }

  get type(): string {
    return this.#state.type ?? 'local';
  }

  get settings(): JsonObject {
    return this.#config.settings;
  }

  get platform(): ContextPlatform<ContextPlatformTypeName, string> | undefined {
    return this.#state.platform;
  }

  getContext(): Context {
    invariant(this.#context, 'No context set');
    return this.#context;
  }

  getHooks(): ServiceHooks {
    return this.#state.hooks;
  }

  getExtendedHooks(): ServiceHooks {
    return this.#state.providerExtendHooks ?? {};
  }

  getPlatform(): ContextPlatform<ContextPlatformTypeName, string> | undefined {
    return this.#state.platform;
  }

  async init(): Promise<void> {
    log(`${this.name}.init()`);

    if (this.#hasInitialized) {
      return;
    }

    this.#hasInitialized = true;

    await this.executeHook('init');

    // console.log(this.#config);
  }

  async finalize(): Promise<void> {
    log(`${this.name}.finalize()`);

    // now that every other service has been initialize
    // we can finalize our configuration to replace any variables
    this.#config = await replaceConfigTemplateVariables(
      this.#config,
      this.#context,
    );

    const depend = this.#config?.dependencies ?? [];

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

  async stage(dir: string): Promise<void> {
    log(`${this.name}.stage()`);

    await this.executeHook('stage', {
      dir,
    });
  }

  async executeHook<Result = Json>(
    name: string,
    args: JsonObject = {},
  ): Promise<Result> {
    log(`${this.name}.executeHook("${name}")`);
    return await executeServiceHook<Result>(this, name, args);
  }

  hook = async <Result = Json>(
    name: string,
    args: JsonObject = {},
  ): Promise<Result> => {
    return this.executeHook<Result>(name, args);
  };

  getContainerUrl(): string {
    const gateway = this.getContext().services.get('gateway');
    return `http://${gateway?.container?.host}:${gateway?.container?.port}/${this.name}/v1`;
  }

  getGatewayUrl(): string {
    const gateway = this.getContext().services.get('gateway');
    const host = gateway?.container?.externalHost ?? '0.0.0.0';
    const routePrefix = gateway?.settings?.routePrefix ?? '';

    if (this.name === 'gateway') {
      return `http://${host}:${gateway?.container?.externalPort}`;
    }

    return `http://${host}:${gateway?.container?.externalPort}/${routePrefix}${this.name}/v1`;
  }
}
