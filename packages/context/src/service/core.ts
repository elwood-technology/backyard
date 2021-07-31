export const coreServiceProviders: Record<string, string> = {
  store: '@backyard/service-postgrest',
  gateway: '@backyard/service-kong',
  db: '@backyard/service-postgresql',
  auth: '@backyard/service-gotrue',
  api: '@backyard/service-postgrest',
};
