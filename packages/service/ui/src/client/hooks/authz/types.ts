export type AuthzState = {
  fetching: boolean;
  error?: Error;
  services: Array<{
    name: string;
    ui: boolean;
    api: boolean;
  }>;
};
