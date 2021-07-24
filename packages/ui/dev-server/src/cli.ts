import express from 'express';

import { appendUiDevSeverMiddleware } from './middleware';

export async function main() {
  const cwd = process.cwd();

  process.env.NODE_ENV = 'development';

  const app = express();

  await appendUiDevSeverMiddleware(app, {
    cwd,
    gatewayBaseUrl: 'http://localhost:8080',
    apiAnonKey: 'abc123',
    modules: [
      {
        name: 'service',
        entry: 'main.js',
        port: 8080,
      },
    ],
  });

  app.listen(8080);
}
