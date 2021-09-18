// @ts-nocheck
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const logger = require('./lib/logger')
const config = require('./config')

let server
try {
  const logRequest = require('./middleware/loggerMiddleware').logRequest

  const logErrors = require('./middleware/loggerMiddleware').logErrors

  const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware').errorHandlerMiddleware

  const securityHeaders = require('./setup/securityHeaders')

  const attachRoutes = require('./routes')
  // const init = require('./setup/init')

  server = express()

  logger.info(null, 'STARTING WITH ' + config.env + ' ENVIROMENT')

  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({
    extended: true
  }))

  securityHeaders(server)

  server.use(logRequest)

  // atach routes to server
  attachRoutes(server)

  // log errors
  server.use(logErrors)

  // handle error responses
  server.use(errorHandlerMiddleware)

  server.use('/assets', express.static(path.join(__dirname, 'assets')))

  // load statics
  server.use('/doc', express.static(path.join(__dirname, 'doc')))

  // set port
  const port = process.env.PORT || '3000'
  const env = process.env.NODE_ENV || 'dev'

  // create sequelize tables

  // Start web server
  server.listen(port, async (err) => {
    if (err) {
      logger.error(null, err, 'Unable to start server')
    } else {
      logger.info(null, `Server started on port ${port} with ${env} settings.`)
    }

    // require('./cron/cron')
    // await init.initializeData()
    server.emit('appStarted')
  })
} catch (err) {
  logger.error(null, err, 'Failed to start server')
}

module.exports = server
