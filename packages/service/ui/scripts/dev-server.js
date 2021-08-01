const { resolve } = require('path')

require('../server').boot({
  port: 8080,
  mode: 'development',
  gatewayBaseUrl: 'http://localhost:8080',
  apiAnonKey: 'x',
  webpackContextPath: resolve(__dirname, '../../../../'),
  workingDirectory: resolve(__dirname, '../../../../'),
  modules: [
    {
      name: 'test',
      entry: './packages/service/zuul/backyard-ui.js',
      port: 8081
    }
  ]
})
