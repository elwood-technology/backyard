export const coreServiceProviders: Record<string, string> = {
  gateway: '@backyard/service-kong',
  db: '@backyard/service-postgresql',
  auth: '@backyard/service-gotrue',
  api: '@backyard/service-postgrest',

  // db-migrate is added by the 'db' package
  // so it's not needed here
};
