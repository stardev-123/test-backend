/**
 * Created by laslo on 17.12.18..
 */
const helmet = require('helmet')
const config = require('../config')

module.exports = (app) => {
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", config.serverUrl]
    }
  }))

  app.use(helmet.featurePolicy({
    features: {
      fullscreen: ["'self'"],
      vibrate: ["'none'"],
      payment: ['example.com'],
      syncXhr: ["'none'"]
    }
  }))

  app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
}
