module.exports = require('../lib').createHandler({
  async handler() {
    return {
      body: 'hello world'
    }
  }
})


