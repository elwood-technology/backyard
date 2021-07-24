export type UiServerOptions = {
  mode: 'development' | 'production';
  port?: number;
  gatewayBaseUrl: string;
  apiAnonKey: string;
  webpackContextPath?: string;
  workingDirectory?: string;
  modules: Array<{
    name: string;
    entry: string;
    port: number;
  }>;
};
