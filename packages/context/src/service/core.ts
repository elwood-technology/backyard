export const coreServiceProviders: Record<string, string> = {
  store: '@backyard/service-postgrest',
  gateway: '@backyard/service-kong',
  db: '@backyard/service-postgresql',
  auth: '@backyard/service-gotrue',
  authz: '@backyard/service-zuul',
  ui: '@backyard/service-ui',
};
