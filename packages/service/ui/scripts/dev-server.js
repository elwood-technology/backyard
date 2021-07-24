const { resolve } = require('path')

require('dotenv').config({
  path: resolve(__dirname, '../../../../.backyard/local/.env'),
});



require('../server').boot({
  port: 8080,
  mode: 'development',
  gatewayBaseUrl: process.env.BACKYARD_GATEWAY_URL || 'http://localhost:8080',
  apiAnonKey: process.env.BACKYARD_KEY_ANON || 'x',
  webpackContextPath: resolve(__dirname, '../../../../'),
  workingDirectory: resolve(__dirname, '../../../../'),
  modules: [
    {
      name: 'notifications',
      entry: './packages/service/notifications/backyard-ui.js',
      port: 8081
    }
  ]
});
