export interface ConfigurationServiceStorageSettings {
  projectRef?: string;
  aws: {
    bucket: string;
    region: string;
    key: string;
    secret: string;
  };
}

export interface ConfigurationServiceDatabaseSettings {
  password: string;
  name: string;
  user: string;
}

export interface ConfigurationServiceAuthSettings {
  externalUrl?: string;
  disableSignUp?: boolean;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}
