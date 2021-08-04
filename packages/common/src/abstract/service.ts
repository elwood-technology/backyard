/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ServiceHooks,
  Context,
  ConfigurationService,
  ContextService,
  ConfigurationServiceGateway,
  ConfigurationServiceContainer,
  ServiceHookProviderArgs,
} from '@backyard/types';

export abstract class AbstractService implements Omit<ServiceHooks, 'hooks'> {
  public async config(
    context: Context,
    config: ConfigurationService,
  ): Promise<Partial<ConfigurationService>> {
    return config;
  }

  public async init(context: Context, service: ContextService): Promise<void> {}
  public async stage(args: ServiceHookProviderArgs & { dir: string }) {}
  public async gateway(context: Context, config?: ConfigurationServiceGateway) {
    return config ?? { enabled: false };
  }
  public async container(
    context: Context,
    config?: ConfigurationServiceContainer,
  ) {
    return config ?? { enabled: false };
  }

  public filesystem(context: Context): Context['tools']['filesystem'] {
    return context.tools.filesystem;
  }
}
