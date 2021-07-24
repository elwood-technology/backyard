import type {
  Context,
  ContextService,
  ConfigurationServiceSettings,
} from '@backyard/types';

import { invariant } from '@backyard/common';

export function getServiceByName<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
>(name: string, context: Context): ContextService<Settings> {
  invariant(context.services.has(name), `No service named "${name}"`);
  return context.services.get(name) as ContextService<Settings>;
}

export function createDbUrlFromContext(context: Context): string {
  const db = getServiceByName('db', context);
  const { user, password, name } = db.config.settings || {};

  invariant(user, 'No user in db settings');
  invariant(password, 'No password in db settings');
  invariant(name, 'No name in db settings');
  invariant(db.container?.host, 'Missing db[container.host]');
  invariant(db.container.port, 'Missing db[container.port]');

  return `postgres://${user}:${password}@${db.container.host}:${db.container.port}/${name}?sslmode=disable`;
}

export function getCoreServices(context: Context): ContextService[] {
  return Array.from(context.services.values()).filter(
    (item) => item.type === 'core',
  );
}

export function getServices(context: Context): ContextService[] {
  return Array.from(context.services.values());
}

export function serviceHasGateway(service: ContextService): boolean {
  return !!(service.gateway && service.gateway?.enabled === true);
}
