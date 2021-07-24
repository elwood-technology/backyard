import type {
  Context,
  ContextService,
  ConfigurationServiceSettings,
} from '@backyard/types';

import { invariant } from '@backyard/common';

export function createDbUriFromContext(_context: Context): string {
  return '';
  // return `postgres://${db.user}:${db.password}@${db.containerHost}:${db.port}/${db.name}?sslmode=disable`;
}

export function getServiceByName<
  Settings extends ConfigurationServiceSettings = ConfigurationServiceSettings,
>(name: string, context: Context): ContextService<Settings> {
  invariant(context.services.has(name), `No service named "${name}"`);

  return context.services.get(name) as ContextService<Settings>;
}
