import type {
  Context,
  ContextService,
  ConfigurationService,
} from '@backyard/types';
import { invariant, debug } from '@backyard/common';

import { Service } from './service';

const log = debug('backyard:context:state');

export class ContextState implements Context {
  readonly #state: Partial<Context> = {};
  readonly #services: Map<string, ContextService> = new Map();

  constructor(state: Omit<Context, 'services' | 'getService' | 'addService'>) {
    this.#state = state;
  }

  getValue<T>(name: keyof Context): T {
    invariant(this.#state[name], `Unable to find ${name} in context`);
    return this.#state[name] as T;
  }

  get mode(): Context['mode'] {
    return this.getValue('mode');
  }

  get config(): Context['config'] {
    return this.getValue('config');
  }

  get services(): Context['services'] {
    return this.#services;
  }

  get settings(): Context['settings'] {
    return this.getValue('settings');
  }

  get dir(): Context['dir'] {
    return this.getValue('dir');
  }

  get platforms(): Context['platforms'] {
    return this.getValue('platforms');
  }

  get tools(): Context['tools'] {
    return this.getValue('tools');
  }

  get log(): Context['log'] {
    return this.getValue('log');
  }

  async addService(
    config: ConfigurationService,
    tryToInitialize = false,
  ): Promise<void> {
    log('adding %s to context', config.name);

    if (this.#services.has(config.name)) {
      log(`Service "${config.name}" already exists`);
      return;
    }

    invariant(config.provider, 'Service must have a provider');

    const service = new Service(config);
    service.setContext(this);

    await service.load();

    if (tryToInitialize) {
      await service.init();
      await service.finalize();
    }

    this.#services.set(config.name, service);
  }

  getService(name: string): ContextService {
    invariant(
      this.services.has(name),
      `Context does not have service named "${name}"`,
    );

    return this.services.get(name) as ContextService;
  }
}
