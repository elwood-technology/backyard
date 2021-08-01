export const coreServiceProviders: Record<string, string> = {
  gateway: '@backyard/service-kong',
  db: '@backyard/service-postgresql',
  auth: '@backyard/service-gotrue',
  api: '@backyard/service-postgrest',
  'db-migrate': '@backyard/service-postgresql-migrate',
};
