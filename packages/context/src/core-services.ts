export const coreServiceProviders: Record<string, string> = {
  gateway: '@backyard/service-kong',

  // db-migrate is added by the 'db' package
  // so it's not needed here
};
